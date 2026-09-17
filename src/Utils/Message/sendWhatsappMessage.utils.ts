import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode";
import path from "node:path";
import fs from "node:fs";

let isReady = false;
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(process.cwd(), ".wwebjs_auth"),
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  },
});

client.on("loading_screen", (percent, message) => {
  console.log(`WhatsApp Loading: ${percent}% - ${message}`);
});

client.on("qr", async (qr) => {
  try {
    console.log("WhatsApp QR Code received.");

    qrcode.generate(qr, { small: true });

    const dirPath = path.join(process.cwd(), "uploads", "qrcodes");
    const filePath = path.join(dirPath, "appointment.png");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    await QRCode.toFile(filePath, qr);

    console.log(`WhatsApp QR Code saved to: ${filePath}`);
  } catch (error) {
    console.error("WhatsApp QR Code Error:", error);
  }
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated successfully.");
});

client.on("ready", () => {
  isReady = true;
  isInitializing = false;

  console.log("WhatsApp Client is READY!");
});

client.on("auth_failure", (message) => {
  isReady = false;
  isInitializing = false;
  initializationPromise = null;

  console.error("WhatsApp Authentication Error:", message);
});

client.on("disconnected", (reason) => {
  isReady = false;
  isInitializing = false;
  initializationPromise = null;

  console.error("WhatsApp Client disconnected:", reason);
});

client.on("change_state", (state) => {
  console.log("WhatsApp State:", state);
});

function initializeWhatsApp(): Promise<void> {
  if (isReady) {
    return Promise.resolve();
  }

  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  isInitializing = true;

  initializationPromise = new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();

      isReady = true;
      isInitializing = false;

      resolve();
    };

    const onAuthFailure = (message: string) => {
      cleanup();

      isReady = false;
      isInitializing = false;
      initializationPromise = null;

      reject(new Error(message));
    };

    const onDisconnected = (reason: string) => {
      cleanup();

      isReady = false;
      isInitializing = false;
      initializationPromise = null;

      reject(new Error(`WhatsApp disconnected: ${reason}`));
    };

    const cleanup = () => {
      client.off("ready", onReady);
      client.off("auth_failure", onAuthFailure);
      client.off("disconnected", onDisconnected);
    };

    client.once("ready", onReady);
    client.once("auth_failure", onAuthFailure);
    client.once("disconnected", onDisconnected);

    client.initialize().catch((error) => {
      cleanup();

      isReady = false;
      isInitializing = false;
      initializationPromise = null;

      reject(error);
    });
  });

  return initializationPromise;
}

export async function sendBookingNotification(
  phone: string,
  bookingData: {
    clientName: string;
    bookingId: string;
    date: string;
    time: string;
  },
): Promise<void> {
  try {
    await initializeWhatsApp();

    let formattedPhone = phone.replace(/\D/g, "");

    if (formattedPhone.startsWith("01")) {
      formattedPhone = "20" + formattedPhone.substring(1);
    }

    const numberDetails = await client.getNumberId(formattedPhone);

    if (!numberDetails) {
      console.error(
        `Phone number +${formattedPhone} is not registered on WhatsApp.`,
      );

      return;
    }

    const message =
      `Hello ${bookingData.clientName} 👋\n\n` +
      `Your booking has been confirmed successfully! 🎉\n` +
      `📌 Booking ID: #${bookingData.bookingId}\n` +
      `📅 Date: ${bookingData.date}\n` +
      `⏰ Time: ${bookingData.time}\n\n` +
      `Thank you for using our service!`;

    await client.sendMessage(numberDetails._serialized, message);

    console.log(
      `WhatsApp notification sent successfully to +${formattedPhone}`,
    );
  } catch (error) {
    console.error("WhatsApp Notification Error:", error);
  }
}

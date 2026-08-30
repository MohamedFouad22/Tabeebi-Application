import { EventEmitter } from "node:events";
import { sendEmail } from "../Email/email.utils";
import { confirmTemplate } from "../Email/Templates/confirmEmail.email.utils";
import { SubjectEnum } from "../Enum/enum.utils";
import Mail from "nodemailer/lib/mailer";
import { welcomeTemplate } from "../Email/Templates/welcomeEmail.utils";
import { resetPasswordTemplate } from "../Email/Templates/forgetPasswordEmail.utils";
import { passwordChangedAlertTemplate } from "../Email/Templates/resetPassword.email";
import { updatePasswordAlertTemplate } from "../Email/Templates/updatePassword.email.utils";

export const eventEmitter = new EventEmitter();

export interface IEmail extends Mail.Options {
  code: number;
  firstName: string;
}

eventEmitter.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.CONFIRM_EMAIL;
    data.html = confirmTemplate(
      data.code,
      data.firstName,
      SubjectEnum.CONFIRM_EMAIL,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Confirm Email ❌");
  }
});

eventEmitter.on("resendOTP", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.RESEND_OTP;
    data.html = confirmTemplate(
      data.code,
      data.firstName,
      SubjectEnum.RESEND_OTP,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send New OTP Email ❌");
  }
});

eventEmitter.on("welcome", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.WELCOME_EMAIL;
    data.html = welcomeTemplate(data.firstName, SubjectEnum.WELCOME_EMAIL);
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Welcome Email ❌");
  }
});

eventEmitter.on("resetPassword", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.RESET_PASSWORD;
    data.html = resetPasswordTemplate(
      data.code,
      data.firstName,
      SubjectEnum.RESET_PASSWORD,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Reset Password Email ❌");
  }
});

eventEmitter.on("resetPasswordAlert", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.RESET_PASSWORD_ALERT;
    data.html = passwordChangedAlertTemplate(
      data.firstName,
      SubjectEnum.RESET_PASSWORD_ALERT,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Reset Password Alert Email ❌");
  }
});

eventEmitter.on("updatePasswordAlert", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.UPDATE_PASSWORD_ALERT;
    data.html = updatePasswordAlertTemplate(
      data.firstName,
      SubjectEnum.UPDATE_PASSWORD_ALERT,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Update Password Alert Email ❌");
  }
});

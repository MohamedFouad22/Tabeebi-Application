import { EventEmitter } from "node:events";
import { sendEmail } from "../Email/email.utils";
import { confirmTemplate } from "../Email/Templates/confirmEmail.email.utils";
import { SubjectEnum } from "../Enum/enum.utils";
import Mail from "nodemailer/lib/mailer";
import { welcomeTemplate } from "../Email/Templates/welcomeEmail.utils";
import { resetPasswordTemplate } from "../Email/Templates/forgetPasswordEmail.utils";
import { passwordChangedAlertTemplate } from "../Email/Templates/resetPassword.email";
import { updatePasswordAlertTemplate } from "../Email/Templates/updatePassword.email.utils";
import { enable2faTemplate } from "../Email/Templates/twoAuthFactor.email.utils";
import { twoAuthFactorConfirmTemplate } from "../Email/Templates/twoAuthFactorLogin.utils";
import { deleteAccountRequestTemplate } from "../Email/Templates/deleteAccountRequest.email";
import { accountDeletedSuccessTemplate } from "../Email/Templates/accountDeleted.email";
import { inviteUserTemplate } from "../Email/Templates/inviteUser.email";
import { contactUsTemplate } from "../Email/Templates/contactUs.email";
import { contactUsConfirmationTemplate } from "../Email/Templates/contactUsUser.email";
import { disable2faTemplate } from "../Email/Templates/disableTwoAuthFactor.email.utils";
import { orderConfirmationTemplate } from "../Email/Templates/orderConfirmationTemplate.email";
import { orderStatusTemplate } from "../Email/Templates/orderStatus.email";
import { orderStatusUpdateTemplate } from "../Email/Templates/updateOrderStatus.email";
import { deleteAccountConfirmationTemplate } from "../Email/Templates/deleteFacility.email";

export const eventEmitter = new EventEmitter();

export interface IEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IEmail extends Mail.Options {
  code: number;
  firstName: string;
  tempToken?: string;
  inviterName?: string;
  inviteLink?: string;
  userName?: string;
  email?: string;
  phone?: string;
  comment?: string;
  total?: number;
  paymentMethod?: string;
  address?: string;
  items?: IEmailItem[];
  status?: string;
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

eventEmitter.on("twoAuthFactorAuthRequest", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.TWO_AUTH_FACTOR_REQUEST;
    data.html = enable2faTemplate(
      data.code,
      data.firstName,
      SubjectEnum.TWO_AUTH_FACTOR_REQUEST,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Two Auth Factor Request Email ❌");
  }
});

eventEmitter.on("twoAuthFactorAuthConfirm", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.TWO_AUTH_FACTOR_CONFIRM;
    data.html = twoAuthFactorConfirmTemplate(
      data.code,
      data.firstName,
      SubjectEnum.TWO_AUTH_FACTOR_CONFIRM,
      data.tempToken,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Two Auth Factor Confirmation Email ❌");
  }
});

eventEmitter.on("deleteAccountRequest", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.DELETE_ACCOUNT_REQUEST;
    data.html = deleteAccountRequestTemplate(
      data.code,
      data.firstName,
      SubjectEnum.DELETE_ACCOUNT_REQUEST,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Delete Account Request Email ❌");
  }
});

eventEmitter.on("deleteAccount", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.DELETE_ACCOUNT_ALERT;
    data.html = accountDeletedSuccessTemplate(
      data.firstName,
      SubjectEnum.DELETE_ACCOUNT_ALERT,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Delete Account Request Email ❌");
  }
});

eventEmitter.on("inviteUser", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.INVITE_USER_EMAIL;
    data.html = inviteUserTemplate(
      data.inviterName as string,
      data.inviteLink as string,
      SubjectEnum.INVITE_USER_EMAIL,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Invite User Email ❌");
  }
});

eventEmitter.on("contactUs", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.CONTACT_US_EMAIL;
    data.html = contactUsTemplate(
      data.userName as string,
      data.email as string,
      data.phone as string,
      data.comment as string,
      SubjectEnum.CONTACT_US_EMAIL,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Contact US Email ❌");
  }
});

eventEmitter.on("contactUsUser", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.CONTACT_US_USER_EMAIL;
    data.html = contactUsConfirmationTemplate(
      data.userName as string,
      SubjectEnum.CONTACT_US_USER_EMAIL,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Contact US User Email ❌");
  }
});

eventEmitter.on("disableTwoAuthFactor", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.TWO_AUTH_FACTOR_REQUEST;
    data.html = disable2faTemplate(
      data.code,
      data.firstName,
      SubjectEnum.TWO_AUTH_FACTOR_REQUEST,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Disable 2FA Email ❌");
  }
});

eventEmitter.on("orderConfirmation", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.CONFIRM_ORDER_EMAIL;
    data.html = orderConfirmationTemplate(
      data.userName as string,
      data.total as number,
      data.paymentMethod as string,
      data.items || [],
      data.address as string,
      data.phone as string,
      SubjectEnum.CONFIRM_ORDER_EMAIL,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Confirm Order Email ❌");
  }
});

eventEmitter.on("orderStatus", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.ORDER_STATUS_EMAIL;
    data.html = orderStatusTemplate(
      data.userName as string,
      data.status as string,
      SubjectEnum.ORDER_STATUS_EMAIL,
      data.address as string,
      data.phone as string,
      data.paymentMethod as string,
      data.total as number,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Order Status Email ❌");
  }
});

eventEmitter.on("updateOrderStatus", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.UPDATE_ORDER_STATUS;
    data.html = orderStatusUpdateTemplate(
      data.userName as string,
      data.status as string,
      data.total as number,
      data.address as string,
      data.phone as string,
      SubjectEnum.UPDATE_ORDER_STATUS,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Update Order Status Email ❌");
  }
});

eventEmitter.on("deleteFacilityRequest", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.DELETE_FACILITY_REQUEST;
    data.html = deleteAccountRequestTemplate(
      data.code as number,
      data.firstName as string,
      SubjectEnum.DELETE_FACILITY_REQUEST,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Delete Facility Request Email ❌");
  }
});

eventEmitter.on("deleteFacility", async (data: IEmail) => {
  try {
    data.subject = SubjectEnum.DELETE_FACILITY;
    data.html = deleteAccountConfirmationTemplate(
      data.firstName as string,
      SubjectEnum.DELETE_FACILITY,
    );
    await sendEmail(data);
  } catch (error) {
    console.log("Failed To Send Delete Facility Email ❌");
  }
});

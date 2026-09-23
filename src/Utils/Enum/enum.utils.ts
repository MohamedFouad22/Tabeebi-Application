export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum ProviderEnum {
  SYSTEM = "SYSTEM",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
}

export enum TwoAuthFactorEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum RoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  COMPANY = "COMPANY",
}

export enum signatureLevelEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  COMPANY = "COMPANY",
}

export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}

export enum LogoutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

export enum storageTypeEnum {
  MEMORY = "MEMORY",
  DISK = "DISK",
}

export enum ItemTypeEnum {
  BRAND = "Brand",
  PRODUCT = "Product",
  DOCTOR = "Doctor",
}

export enum SpecializationEnum {
  DERMATOLOGY = "DERMATOLOGY",
  CARDIOLOGY = "CARDIOLOGY",
  DENTISTRY = "DENTISTRY",
  PEDIATRICS = "PEDIATRICS",
  INTERNAL_MEDICINE = "INTERNAL_MEDICINE",
  OPHTHALMOLOGY = "OPHTHALMOLOGY",
  ORTHOPEDICS = "ORTHOPEDICS",
  GYNECOLOGY = "GYNECOLOGY",
  NEUROLOGY = "NEUROLOGY",
  PSYCHIATRY = "PSYCHIATRY",
  UROLOGY = "UROLOGY",
  ENT = "ENT",
  GENERAL_SURGERY = "GENERAL_SURGERY",
  RADIOLOGY = "RADIOLOGY",
  ANESTHESIOLOGY = "ANESTHESIOLOGY",
  PEDIATRIC_SURGERY = "PEDIATRIC_SURGERY",
  OBSTETRICS = "OBSTETRICS",
  FAMILY_MEDICINE = "FAMILY_MEDICINE",
}

export enum statusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentMethodEnum {
  CARD = "CARD",
  CASH = "CASH",
}

export enum PaymentStatusEnum {
  UNPAID = "UNPAID",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export enum couponStatusEnum {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}

export enum SubjectEnum {
  CONFIRM_EMAIL = "Please Confirm Your Email",
  WELCOME_EMAIL = "Welcome To The Tabeebi Application",
  RESEND_OTP = "Your New Verification Code",
  RESET_PASSWORD = "Please Reset Your Password",
  RESET_PASSWORD_ALERT = "Your Password Has Been Changed",
  UPDATE_PASSWORD_ALERT = "Your Password Has Been Updated",
  TWO_AUTH_FACTOR_REQUEST = "Please confirm The TWO Auth Factor Activation Request",
  TWO_AUTH_FACTOR_CONFIRM = "Please Confirm Your Account",
  DELETE_ACCOUNT_REQUEST = "Please Confirm That You Want To Delete Your Account",
  DELETE_ACCOUNT_ALERT = "Your Account Has Been Permanently Deleted",
  INVITE_USER_EMAIL = "Invitation To Try Tabebbi Application",
  CONTACT_US_EMAIL = "Requesting Assistance From a Client",
  CONTACT_US_USER_EMAIL = "We Received Your Message",
}

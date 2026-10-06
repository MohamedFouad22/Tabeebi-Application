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
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
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

export enum MedicalServiceTypeEnum {
  LABORATORY = "LABORATORY",
  RADIOLOGY = "RADIOLOGY",
}

export enum labSpecializationEnum {
  CLINICAL_CHEMISTRY = "CLINICAL_CHEMISTRY",
  HEMATOLOGY = "HEMATOLOGY",
  MICROBIOLOGY = "MICROBIOLOGY",
  IMMUNOLOGY = "IMMUNOLOGY",
  SEROLOGY = "SEROLOGY",
  PARASITOLOGY = "PARASITOLOGY",
  MOLECULAR_BIOLOGY = "MOLECULAR_BIOLOGY",
  GENETICS = "GENETICS",
  HISTOPATHOLOGY = "HISTOPATHOLOGY",
  CYTOPATHOLOGY = "CYTOPATHOLOGY",
  BLOOD_BANK = "BLOOD_BANK",
  COAGULATION = "COAGULATION",
  ENDOCRINOLOGY = "ENDOCRINOLOGY",
  TOXICOLOGY = "TOXICOLOGY",
  URINALYSIS = "URINALYSIS",
  BODY_FLUID_ANALYSIS = "BODY_FLUID_ANALYSIS",
  AUTOIMMUNITY = "AUTOIMMUNITY",
  ALLERGY_TESTING = "ALLERGY_TESTING",
  INFECTIOUS_DISEASE_TESTING = "INFECTIOUS_DISEASE_TESTING",
  REPRODUCTIVE_MEDICINE = "REPRODUCTIVE_MEDICINE",
  PRENATAL_TESTING = "PRENATAL_TESTING",
}

export enum RadiologySpecialtyEnum {
  X_RAY = "X_RAY",
  CT_SCAN = "CT_SCAN",
  MRI = "MRI",
  ULTRASOUND = "ULTRASOUND",
  DOPPLER = "DOPPLER",
  MAMMOGRAPHY = "MAMMOGRAPHY",
  FLUOROSCOPY = "FLUOROSCOPY",
  PET_SCAN = "PET_SCAN",
  NUCLEAR_MEDICINE = "NUCLEAR_MEDICINE",
  DEXA_SCAN = "DEXA_SCAN",
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
  CONFIRM_ORDER_EMAIL = "Confirm Your Order",
  ORDER_STATUS_EMAIL = "Your Order Status",
  UPDATE_ORDER_STATUS = "Your Order Status",
}

import * as z from "zod";
import {
  facilityAccountStatusEnum,
  labSpecializationEnum,
  MedicalServiceTypeEnum,
  RadiologySpecialtyEnum,
} from "../../Utils/Enum/enum.utils";
import { generalFields } from "../../Middleware/generalFields.utils";
import { Types } from "mongoose";

export const createFacilitySchema = {
  body: z
    .strictObject({
      facilityName: z
        .string()
        .trim()
        .min(2, "Facility Name Must Be At Least 2 Characters")
        .max(150, "Facility Name Must Be At Most 150 Characters")
        .lowercase(),

      serviceType: z.enum(MedicalServiceTypeEnum),

      labSpecialization: z.preprocess(
        (val) => {
          if (typeof val !== "string") return val;

          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        },
        z.array(z.enum(labSpecializationEnum)).optional(),
      ),

      radiologySpecialty: z.preprocess(
        (val) => {
          if (typeof val !== "string") return val;

          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        },
        z.array(z.enum(RadiologySpecialtyEnum)).optional(),
      ),

      address: z
        .string()
        .trim()
        .min(2, "Address Must Be At Least 2 Characters")
        .max(500, "Address Must Be At Most 500 Characters"),

      phone: generalFields.phone,

      workingSchedule: z.preprocess(
        (val) => {
          if (typeof val !== "string") return val;

          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        },
        z
          .array(
            z.strictObject({
              day: z.string().trim().min(1, "Day Is Required"),
              from: z
                .string()
                .regex(
                  /^([01]\d|2[0-3]):([0-5]\d)$/,
                  "Invalid From Time Format",
                ),
              to: z
                .string()
                .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid To Time Format"),
              isDayOff: z.boolean(),
            }),
          )
          .min(1, "Working Schedule Must Contain At Least One Day"),
      ),

      email: generalFields.email.optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.serviceType === MedicalServiceTypeEnum.LABORATORY &&
        data.radiologySpecialty
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Laboratory Facility Can't Have Radiology Specialty",
          path: ["radiologySpecialty"],
        });
      }

      if (
        data.serviceType === MedicalServiceTypeEnum.RADIOLOGY &&
        data.labSpecialization
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Radiology Facility Can't Have Lab Specialization",
          path: ["labSpecialization"],
        });
      }

      if (
        data.serviceType === MedicalServiceTypeEnum.LABORATORY &&
        !data.labSpecialization
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Must Choose Lab Specialization",
          path: ["labSpecialization"],
        });
      }

      if (
        data.serviceType === MedicalServiceTypeEnum.RADIOLOGY &&
        !data.radiologySpecialty
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Must Choose Radiology Specialization",
          path: ["radiologySpecialty"],
        });
      }

      if (data.workingSchedule) {
        data.workingSchedule.forEach((schedule, index) => {
          if (schedule.isDayOff) return;

          if (schedule.from >= schedule.to) {
            ctx.addIssue({
              code: "custom",
              message: "From Time Must Be Before To Time",
              path: ["workingSchedule", index, "from"],
            });
          }
        });
      }
    }),
};

export const getFacilitiesSchema = {
  query: z
    .strictObject({
      serviceType: z.enum(MedicalServiceTypeEnum).optional(),
      labSpecialization: z.enum(labSpecializationEnum).optional(),
      radiologySpecialty: z.enum(RadiologySpecialtyEnum).optional(),
      name: z.string().trim().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
};

export const getFacilitySchema = {
  params: z.strictObject({
    facilityId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid Facility ID Format",
    }),
  }),
};

export const updateFacilitySchema = {
  params: z.strictObject({
    facilityId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid Facility ID Format",
    }),
    userId: z
      .string()
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid User ID Format",
      })
      .optional(),
  }),
  body: z
    .strictObject({
      facilityName: z
        .string()
        .trim()
        .min(2, "Facility Name Must Be At Least 2 Characters")
        .max(150, "Facility Name Must Be At Most 150 Characters")
        .lowercase()
        .optional(),

      serviceType: z.enum(MedicalServiceTypeEnum).optional(),

      labSpecialization: z.preprocess(
        (val) => {
          if (typeof val !== "string") return val;

          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        },
        z.array(z.enum(labSpecializationEnum)).optional(),
      ),

      radiologySpecialty: z.preprocess(
        (val) => {
          if (typeof val !== "string") return val;

          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        },
        z.array(z.enum(RadiologySpecialtyEnum)).optional(),
      ),

      address: z
        .string()
        .trim()
        .min(2, "Address Must Be At Least 2 Characters")
        .max(500, "Address Must Be At Most 500 Characters")
        .optional(),

      phone: generalFields.phone.optional(),

      workingSchedule: z
        .preprocess(
          (val) => {
            if (typeof val !== "string") return val;

            try {
              return JSON.parse(val);
            } catch {
              return val;
            }
          },
          z
            .array(
              z.strictObject({
                day: z.string().trim().min(1, "Day Is Required"),
                from: z
                  .string()
                  .regex(
                    /^([01]\d|2[0-3]):([0-5]\d)$/,
                    "Invalid From Time Format",
                  ),
                to: z
                  .string()
                  .regex(
                    /^([01]\d|2[0-3]):([0-5]\d)$/,
                    "Invalid To Time Format",
                  ),
                isDayOff: z.boolean(),
              }),
            )
            .min(1, "Working Schedule Must Contain At Least One Day"),
        )
        .optional(),

      email: generalFields.email.optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.serviceType === MedicalServiceTypeEnum.LABORATORY &&
        data.radiologySpecialty
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Laboratory Facility Can't Have Radiology Specialty",
          path: ["radiologySpecialty"],
        });
      }

      if (
        data.serviceType === MedicalServiceTypeEnum.RADIOLOGY &&
        data.labSpecialization
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Radiology Facility Can't Have Lab Specialization",
          path: ["labSpecialization"],
        });
      }

      if (data.labSpecialization && data.radiologySpecialty) {
        ctx.addIssue({
          code: "custom",
          message:
            "Cannot Provide Both Lab Specialization And Radiology Specialty",
          path: ["radiologySpecialty"],
        });
      }

      if (data.workingSchedule) {
        data.workingSchedule.forEach((schedule, index) => {
          if (schedule.isDayOff) return;

          if (schedule.from >= schedule.to) {
            ctx.addIssue({
              code: "custom",
              message: "From Time Must Be Before To Time",
              path: ["workingSchedule", index, "from"],
            });
          }
        });
      }
    }),
};

export const accountStatusSchema = {
  params: z.strictObject({
    facilityId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid Facility ID Format",
    }),
    userId: z
      .string()
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid User ID Format",
      })
      .optional(),
  }),
  query: z.strictObject({
    slug: z
      .enum(facilityAccountStatusEnum)
      .default(facilityAccountStatusEnum.DISABLE),
  }),
};

export const deleteFacilityReqSchema = {
  params: z.strictObject({
    facilityId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid Facility ID Format",
    }),
    userId: z
      .string()
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid User ID Format",
      })
      .optional(),
  }),
};

export const deleteAccountSchema = {
  params: z.strictObject({
    facilityId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: "Invalid Facility ID Format",
    }),
    userId: z
      .string()
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid User ID Format",
      })
      .optional(),
  }),
  body: z.strictObject({
    otp: z.string(),
  }),
};

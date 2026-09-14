import * as z from "zod";
import {
  createClinicSchema,
  deleteClinicSchema,
  getAllClinicsSchema,
  getClinicSchema,
  updateClinicDoctorsSchema,
  updateClinicSchema,
} from "./clinic.validation";

export type IcreateClinicDTO = z.infer<typeof createClinicSchema.body>;
export type IgetAllClinicsDTO = z.infer<typeof getAllClinicsSchema.query>;
export type IgetClinicDTO = z.infer<typeof getClinicSchema.params>;
export type IupdateClinicParamsDto = z.infer<typeof updateClinicSchema.params>;
export type IupdateClinicDto = z.infer<typeof updateClinicSchema.body>;
export type IdeleteClinicDTO = z.infer<typeof deleteClinicSchema.params>;
export type IupdateClinicDoctorsParamsDTO = z.infer<
  typeof updateClinicDoctorsSchema.params
>;
export type IupdateClinicDoctorsDTO = z.infer<
  typeof updateClinicDoctorsSchema.body
>;

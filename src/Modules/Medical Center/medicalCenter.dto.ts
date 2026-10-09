import * as z from "zod";
import {
  accountStatusSchema,
  createFacilitySchema,
  deleteAccountSchema,
  deleteFacilityReqSchema,
  getFacilitiesSchema,
  getFacilitySchema,
  getTestsSchema,
  updateFacilitySchema,
  updateTestDetailesSchema,
  updateTestsSchema,
} from "./medicalCenter.validation";

export type createClinicDTO = z.infer<typeof createFacilitySchema.body>;
export type getFacilitiesDTO = z.infer<typeof getFacilitiesSchema.query>;
export type getFacilityDTO = z.infer<typeof getFacilitySchema.params>;
export type updateFacilityParamsDTO = z.infer<
  typeof updateFacilitySchema.params
>;
export type updateFacilityDTO = z.infer<typeof updateFacilitySchema.body>;
export type accountStatusParamsDTO = z.infer<typeof accountStatusSchema.params>;
export type accountStatusDTO = z.infer<typeof accountStatusSchema.query>;
export type deleteFacilityDTO = z.infer<typeof deleteFacilityReqSchema.params>;
export type deleteAccountParamsDTO = z.infer<typeof deleteAccountSchema.params>;
export type deleteAccountDTO = z.infer<typeof deleteAccountSchema.body>;
export type updateTestsParamsDTO = z.infer<typeof updateTestsSchema.params>;
export type updateTestsDTO = z.infer<typeof updateTestsSchema.body>;
export type getTestsDTO = z.infer<typeof getTestsSchema.params>;
export type updateTestDetailesParamsDTO = z.infer<
  typeof updateTestDetailesSchema.params
>;
export type updateTestDetailesDTO = z.infer<
  typeof updateTestDetailesSchema.body
>;

import * as z from "zod";
import {
  brandReviewsSchema,
  createBrandSchema,
  deleteBrandSchema,
  getSpecificBrandSchema,
  reteBrandSchema,
  updateBrandSchema,
} from "./brand.validation";

export type createBrandDTO = z.infer<typeof createBrandSchema.body>;
export type getSpecificBrandDTO = z.infer<typeof getSpecificBrandSchema.params>;
export type updateBrandDTO = z.infer<typeof updateBrandSchema.body>;
export type updateBrandParamsDTO = z.infer<typeof updateBrandSchema.params>;
export type deleteBrandDTO = z.infer<typeof deleteBrandSchema.params>;
export type rateBrandDTO = z.infer<typeof reteBrandSchema.body>;
export type rateBrandParamsDTO = z.infer<typeof reteBrandSchema.params>;
export type brandReviewsDTO = z.infer<typeof brandReviewsSchema.params>;
export type brandReviewsQueryDTO = z.infer<typeof brandReviewsSchema.query>;

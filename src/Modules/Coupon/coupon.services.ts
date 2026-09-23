import { Request, Response } from "express";
import { IcreateCouponDTO } from "./coupon.dto";
import { CouponRepository } from "../../DB/Repositories/coupon.repository";
import { couponModel } from "../../DB/Models/coupon.model";
import {
  BadRequestException,
  ConflictException,
} from "../../Utils/Security/Error/global.error.utils";

class CouponServices {
  private _couponModel = new CouponRepository(couponModel);
  constructor() {}

  createCoupon = async (req: Request, res: Response): Promise<Response> => {
    const {
      code,
      couponAvailableAt,
      couponDiscount,
      couponDiscountAmount,
      maxUsage,
      couponExpiredAt,
    }: IcreateCouponDTO = req.body;

    const checkCoupon = await this._couponModel.findOne({ filter: { code } });
    if (checkCoupon) throw new ConflictException("This Code Already Exists");

    const availableAt = couponAvailableAt
      ? couponAvailableAt
      : new Date(Date.now());

    const [coupon] = await this._couponModel.create({
      data: [
        {
          createdBy: req.decoded._id,
          code,
          couponAvailableAt: availableAt,
          couponDiscount,
          couponDiscountAmount,
          maxUsage,
          couponExpiredAt,
        },
      ],
    });
    if (!coupon) throw new BadRequestException("Failed To Create Coupon");

    return res.status(201).json({ message: "Coupon Created Successfully" });
  };
}
export default new CouponServices();

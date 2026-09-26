import { Request, Response } from "express";
import {
  checkCouponValidityDTO,
  deleteCouponDTO,
  getCouponDTO,
  IcreateCouponDTO,
  updateCouponDTO,
  updateCouponParamsDTO,
} from "./coupon.dto";
import { CouponRepository } from "../../DB/Repositories/coupon.repository";
import { couponModel } from "../../DB/Models/coupon.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { couponStatusEnum, RoleEnum } from "../../Utils/Enum/enum.utils";

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

  getCoupons = async (req: Request, res: Response): Promise<Response> => {
    const filter: Record<string, any> =
      req.decoded.role === RoleEnum.ADMIN ? {} : { createdBy: req.decoded._id };

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [coupons, totalCoupons] = await Promise.all([
      this._couponModel.find({
        filter,
        projection: "-updatedAt -__v",
        options: {
          page,
          limit,
          skip,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName email" }],
        },
      }),
      this._couponModel.countDocuments({ filter }),
    ]);

    const totalPages = Math.ceil(totalCoupons / limit);

    return res.status(200).json({
      message: "Get Coupons Successfully",
      Pagination: {
        currentPage: page,
        limit,
        skip,
        totalCoupons,
        totalPages,
      },
      coupons,
    });
  };

  getCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { couponId } = req.params as getCouponDTO;
    const filter: Record<string, any> = { _id: couponId };

    if (
      req.decoded.role === RoleEnum.COMPANY ||
      req.decoded.role === RoleEnum.DOCTOR
    ) {
      filter.createdBy = req.decoded._id;
    }

    const coupon = await this._couponModel.findOne({
      filter,
      projection: "-updatedAt -__v",
      options: {
        populate: [{ path: "createdBy", select: "firstName lastName email" }],
      },
    });
    if (!coupon)
      throw new NotFoundException(
        "Coupon Not Found Or Not Allowed To Get This Coupon",
      );

    return res.status(200).json({ message: "Get Coupon Successfully", coupon });
  };

  updateCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { couponId } = req.params as updateCouponParamsDTO;
    const {
      couponStatus,
      couponAvailableAt,
      couponExpiredAt,
      couponDiscount,
      couponDiscountAmount,
      maxUsage,
    }: updateCouponDTO = req.body;

    const filter: Record<string, any> = {
      _id: couponId,
      ...(req.decoded.role !== RoleEnum.ADMIN && {
        createdBy: req.decoded._id,
      }),
    };

    const checkCoupon = await this._couponModel.findOne({ filter });
    if (!checkCoupon)
      throw new NotFoundException(
        "Coupon Not Found Or Not Allowed To Update This Coupon",
      );

    const effectiveAvailableAt =
      couponAvailableAt || checkCoupon.couponAvailableAt;
    const effectiveExpiredAt = couponExpiredAt || checkCoupon.couponExpiredAt;

    if (
      effectiveAvailableAt &&
      effectiveExpiredAt &&
      new Date(effectiveExpiredAt) <= new Date(effectiveAvailableAt)
    ) {
      throw new BadRequestException(
        "couponExpiredAt must be after couponAvailableAt",
      );
    }

    const updateData: Record<string, any> = {
      $set: {
        ...(couponStatus && { couponStatus }),
        ...(couponAvailableAt && { couponAvailableAt }),
        ...(couponExpiredAt && { couponExpiredAt }),
        ...(maxUsage && { maxUsage }),
      },
      $inc: { __v: 1 },
    };

    if (couponDiscount !== undefined) {
      updateData.$set.couponDiscount = couponDiscount;
      updateData.$unset = { couponDiscountAmount: "" };
    } else if (couponDiscountAmount !== undefined) {
      updateData.$set.couponDiscountAmount = couponDiscountAmount;
      updateData.$unset = { couponDiscount: "" };
    }

    const coupon = await this._couponModel.updateOne({
      filter,
      update: updateData,
    });

    if (!coupon) throw new BadRequestException("Failed To Update Coupon");

    return res.status(200).json({ message: "Coupon Updated Successfully" });
  };

  deleteCoupon = async (req: Request, res: Response): Promise<Response> => {
    const { couponId } = req.params as deleteCouponDTO;
    const filter: Record<string, any> = {
      _id: couponId,
      ...(req.decoded.role !== RoleEnum.ADMIN && {
        createdBy: req.decoded._id,
      }),
    };

    const checkCoupon = await this._couponModel.findOne({ filter });
    if (!checkCoupon)
      throw new NotFoundException(
        "Coupon Not Found Or Not Allowed For You To Delete Coupon",
      );

    const coupon = await this._couponModel.deleteOne({ filter });
    if (!coupon) throw new BadRequestException("Failed To Delete Coupon");

    return res.status(200).json({ message: "Coupon Deleted Successfully" });
  };

  checkCouponValidity = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { coupon } = req.params as checkCouponValidityDTO;

    const checkCoupon = await this._couponModel.findOne({
      filter: { code: coupon },
      projection: "-createdAt -updatedAt -__v",
    });
    if (!checkCoupon) throw new NotFoundException("Coupon Not Found");

    if (
      checkCoupon.couponAvailableAt &&
      checkCoupon.couponAvailableAt > new Date()
    )
      throw new BadRequestException("Coupon Is Not Available Now");

    if (
      checkCoupon.couponStatus === couponStatusEnum.EXPIRED ||
      (checkCoupon.couponExpiredAt && checkCoupon.couponExpiredAt <= new Date())
    )
      throw new BadRequestException("Coupon Is Expired");

    if (checkCoupon.maxUsage && checkCoupon.maxUsage <= checkCoupon.usageCount)
      throw new BadRequestException(
        "The Maximum Usage Limit For This Coupon Has Been Reached",
      );

    return res.status(200).json({
      message: "Check Coupon Validity Successfully",
      Data: { checkCoupon },
    });
  };
}
export default new CouponServices();

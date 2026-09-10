import { Request, Response } from "express";
import {
  brandReviewsDTO,
  brandReviewsQueryDTO,
  createBrandDTO,
  deleteBrandDTO,
  getSpecificBrandDTO,
  rateBrandDTO,
  rateBrandParamsDTO,
  updateBrandDTO,
  updateBrandParamsDTO,
} from "./brand.dto";
import { BrandRepository } from "../../DB/Repositories/brand.repository";
import { brandModel } from "../../DB/Models/brand.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { deleteFile, uploadFile } from "../../Utils/Multer/aws.services.utils";
import { Types } from "mongoose";
import { ItemTypeEnum, RoleEnum } from "../../Utils/Enum/enum.utils";
import { RateRepository } from "../../DB/Repositories/rate.repository";
import { rateModel } from "../../DB/Models/rate.model";

class BrandServices {
  private _brandModel = new BrandRepository(brandModel);
  private _rateModel = new RateRepository(rateModel);
  constructor() {}

  createBrand = async (req: Request, res: Response): Promise<Response> => {
    const { brandName, description, rate }: createBrandDTO = req.body;

    const brand = await this._brandModel.findOne({ filter: { brandName } });
    if (brand) throw new ConflictException("Brand Already Exists");

    if (!req.file) throw new BadRequestException("Brand Logo Is Required");

    const key = await uploadFile({
      path: `Brand/Logo/${req.user._id}`,
      file: req.file as Express.Multer.File,
    });

    const newBrand = await this._brandModel.create({
      data: [
        {
          brandName,
          brandLogo: key,
          createdBy: req.user._id,
          description,
          rate,
        },
      ],
    });
    if (!newBrand) throw new BadRequestException("Failed To Create Brand");

    return res.status(201).json({ message: "Brand Created Successfully" });
  };

  getBrands = async (req: Request, res: Response): Promise<Response> => {
    const brands = await this._brandModel.find({});

    if (brands.length < 1) {
      return res.status(200).json({ message: "Not Found Brands", brands: [] });
    }

    return res.status(200).json({ message: "Get Brands Successfully", brands });
  };

  getSpecificBrand = async (req: Request, res: Response): Promise<Response> => {
    const { brandId } = req.params as unknown as getSpecificBrandDTO;

    const brand = await this._brandModel.findOne({
      filter: {
        _id: brandId,
      },
    });
    if (!brand) throw new NotFoundException("Brand Not Found");

    return res.status(200).json({ message: "Get Brand Successfully", brand });
  };

  updateBrand = async (req: Request, res: Response): Promise<Response> => {
    const { brandName, description }: updateBrandDTO = req.body;
    const { brandId } = req.params as updateBrandParamsDTO;

    const filter: Record<string, any> = { _id: brandId };
    if (req.decoded.role !== RoleEnum.ADMIN) {
      filter.createdBy = req.user._id;
    }

    const brand = await this._brandModel.findOne({
      filter,
    });
    if (!brand) throw new NotFoundException("Brand Not Found");

    let url;
    if (req.file) {
      if (brand.brandLogo) {
        await deleteFile({ Key: brand.brandLogo });
      }

      url = await uploadFile({
        path: `Brand/Logo/${req.user._id}`,
        file: req.file as Express.Multer.File,
      });
    }

    await this._brandModel.updateOne({
      filter,
      update: {
        ...(brandName && {
          brandName,
        }),
        ...(url && { brandLogo: url }),
        ...(description && {
          description,
        }),
        $inc: { __v: 1 },
      },
    });

    return res.status(200).json({ message: "Brand Updated Successfully" });
  };

  deleteBrand = async (req: Request, res: Response): Promise<Response> => {
    const { brandId } = req.params as deleteBrandDTO;

    const filter: Record<string, any> = { _id: brandId };

    if (req.user.role !== RoleEnum.ADMIN) {
      filter.createdBy = req.user._id;
    }

    const brand = await this._brandModel.findOne({
      filter,
    });
    if (!brand) throw new NotFoundException("Brand Not Found");

    if (brand?.brandLogo) {
      await deleteFile({ Key: brand.brandLogo });
    }

    await this._brandModel.deleteOne({ filter });

    return res.status(200).json({ message: "Brand Deleted Successfully" });
  };

  rateBrand = async (req: Request, res: Response): Promise<Response> => {
    const { brandId } = req.params as rateBrandParamsDTO;
    const { rate, comment }: rateBrandDTO = req.body;

    const brand = await this._brandModel.findOne({ filter: { _id: brandId } });
    if (!brand) throw new NotFoundException("Brand Not Found");

    const checkRate = await this._rateModel.findOne({
      filter: { item: brandId, userId: req.decoded._id },
    });
    if (!checkRate) {
      await this._rateModel.create({
        data: [
          {
            rate,
            comment,
            userId: req.decoded._id,
            item: brandId,
            itemType: ItemTypeEnum.BRAND,
          },
        ],
      });

      return res
        .status(201)
        .json({ message: "Brand evaluation created successfully" });
    } else {
      await this._rateModel.updateOne({
        filter: { item: brandId, userId: req.decoded._id },
        update: {
          ...(rate !== undefined && { rate }),
          ...(comment !== undefined && { comment }),
          $inc: { __v: 1 },
        },
      });
    }

    return res
      .status(200)
      .json({ message: "The Brand Has Been Successfully Evaluated" });
  };

  getBrandReviews = async (req: Request, res: Response): Promise<Response> => {
    const { brandId } = req.params as brandReviewsDTO;
    const { page, limit } = req.query as unknown as brandReviewsQueryDTO;

    const skip = (page - 1) * limit;
    const filter = { item: brandId, itemType: ItemTypeEnum.BRAND };
    const [reviews, totalCount] = await Promise.all([
      this._rateModel.find({
        filter,
        projection: "-updatedAt -itemType -__v",
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
          populate: {
            path: "userId",
            select: "email userName",
          },
        },
      }),
      this._rateModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    if (reviews.length < 1) {
      return res
        .status(200)
        .json({ message: "Not Found Reviews", reviews: [] });
    }

    return res.status(200).json({
      message: "Get Reviews Successfully",
      metadata: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      reviews,
    });
  };
}
export default new BrandServices();

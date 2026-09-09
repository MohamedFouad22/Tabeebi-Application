import { Request, Response } from "express";
import {
  createBrandDTO,
  deleteBrandDTO,
  getSpecificBrandDTO,
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
import { RoleEnum } from "../../Utils/Enum/enum.utils";

class BrandServices {
  private _brandModel = new BrandRepository(brandModel);
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
}
export default new BrandServices();

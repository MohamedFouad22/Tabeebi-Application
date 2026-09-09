import { Request, Response } from "express";
import { createBrandDTO, getSpecificBrandDTO } from "./brand.dto";
import { BrandRepository } from "../../DB/Repositories/brand.repository";
import { brandModel } from "../../DB/Models/brand.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import { uploadFile } from "../../Utils/Multer/aws.services.utils";

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
}
export default new BrandServices();

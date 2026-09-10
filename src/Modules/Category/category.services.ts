import { Request, Response } from "express";
import { createCategoryDTO, getCategoryDTO } from "./category.dto";
import { CategoryRepository } from "../../DB/Repositories/category.repository";
import { categoryModel } from "../../DB/Models/category.model";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/Security/Error/global.error.utils";
import { RoleEnum } from "../../Utils/Enum/enum.utils";
import { uploadFiles } from "../../Utils/Multer/aws.services.utils";
import { BrandRepository } from "../../DB/Repositories/brand.repository";
import { brandModel } from "../../DB/Models/brand.model";
import { Types } from "mongoose";

export class categoryServices {
  private _categoryModel = new CategoryRepository(categoryModel);
  private _brandModel = new BrandRepository(brandModel);
  constructor() {}

  createCategory = async (req: Request, res: Response): Promise<Response> => {
    const {
      categoryName,
      categoryDescription,
      brands,
      topBrands,
    }: createCategoryDTO = req.body;

    const category = await this._categoryModel.findOne({
      filter: { categoryName: categoryName.toLowerCase() },
    });
    if (category) throw new ConflictException("Category Already Exists");

    const uniqueBrandIds = Array.from(new Set(brands.flat(Infinity))).map(
      (brand) => new Types.ObjectId(brand as string),
    );

    const uniqueTopBrandIds = topBrands
      ? Array.from(new Set(topBrands.flat(Infinity))).map(
          (brand) => new Types.ObjectId(brand as string),
        )
      : undefined;

    const [filterBrand, filterTopBrands] = await Promise.all([
      this._brandModel.find({
        filter: { _id: { $in: uniqueBrandIds } },
      }),
      uniqueTopBrandIds && uniqueTopBrandIds.length > 0
        ? this._brandModel.find({
            filter: { _id: { $in: uniqueTopBrandIds } },
          })
        : Promise.resolve([]),
    ]);

    if (filterBrand.length !== uniqueBrandIds.length) {
      throw new NotFoundException("One or more Brands were Not Found");
    }

    if (
      uniqueTopBrandIds &&
      filterTopBrands.length !== uniqueTopBrandIds.length
    ) {
      throw new NotFoundException("One or more Top Brands were Not Found");
    }

    const files = req.files as Express.Multer.File[];
    let urls: string[] | undefined;

    if (files && files.length > 0) {
      urls = await uploadFiles({
        path: `Category/Category Images/${req.decoded._id}`,
        files,
      });
    }

    await this._categoryModel.create({
      data: [
        {
          categoryName: categoryName.toLowerCase(),
          ...(categoryDescription && { categoryDescription }),
          createdBy: req.decoded._id,
          ...(urls && { categoryImage: urls }),
          brands: uniqueBrandIds,
          ...(topBrands && { topBrands: uniqueTopBrandIds }),
        },
      ],
    });

    return res.status(201).json({ message: "Category Created Successfully" });
  };

  getCategories = async (req: Request, res: Response): Promise<Response> => {
    const categories = await this._categoryModel.find({
      projection: "-createdAt -updatedAt -__v",
    });

    if (categories.length < 1) {
      return res
        .status(200)
        .json({ message: "Not Found Categories", categories: [] });
    }

    return res
      .status(200)
      .json({ message: "Get Categories Successfully", categories });
  };

  getSpecificCategory = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { categoryId } = req.params as getCategoryDTO;

    const category = await this._categoryModel.findOne({
      filter: { _id: categoryId },
      projection: "-createdAt -updatedAt -__v",
    });
    if (!category) throw new NotFoundException("Category Not Found");

    return res
      .status(200)
      .json({ message: "Get Category Successfully", category });
  };
}
export default new categoryServices();

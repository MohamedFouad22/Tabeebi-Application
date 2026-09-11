import { Request, Response } from "express";
import {
  createCategoryDTO,
  getCategoryDTO,
  updateCategoryParamsSchema,
  updateCategorySchema,
} from "./category.dto";
import { CategoryRepository } from "../../DB/Repositories/category.repository";
import { categoryModel } from "../../DB/Models/category.model";
import {
  ConflictException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import {
  deleteFiles,
  uploadFiles,
} from "../../Utils/Multer/aws.services.utils";
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

  updateCategory = async (req: Request, res: Response): Promise<Response> => {
    const { categoryId } = req.params as updateCategoryParamsSchema;
    const {
      categoryName,
      categoryDescription,
      brands,
      topBrands,
    }: updateCategorySchema = req.body;

    const category = await this._categoryModel.findOne({
      filter: { _id: categoryId },
    });
    if (!category) throw new NotFoundException("Category Not Found");

    let keys;
    if (Array.isArray(req.files) && req.files?.length > 0) {
      await deleteFiles({
        urls: category.categoryImage as string[],
      });

      keys = await uploadFiles({
        path: `Category/Category Images/${req.decoded._id}`,
        files: req.files as Express.Multer.File[],
      });
    }

    let uniqueBrands;
    if (brands) {
      uniqueBrands = Array.from(new Set(brands.flat(Infinity))).map((brand) => {
        return new Types.ObjectId(brand as string);
      });
    }

    let uniqueTopBrands;
    if (topBrands) {
      uniqueTopBrands = Array.from(new Set(topBrands.flat(Infinity))).map(
        (brand) => {
          return new Types.ObjectId(brand as string);
        },
      );
    }

    const [filterBrand, filterTopBrands] = await Promise.all([
      uniqueBrands && uniqueBrands.length > 0
        ? this._brandModel.find({
            filter: { _id: { $in: uniqueBrands } },
          })
        : Promise.resolve([]),

      uniqueTopBrands && uniqueTopBrands.length > 0
        ? this._brandModel.find({
            filter: { _id: { $in: uniqueTopBrands } },
          })
        : Promise.resolve([]),
    ]);

    if (uniqueBrands && filterBrand.length !== uniqueBrands.length) {
      throw new NotFoundException("One or more Brands were Not Found");
    }

    if (uniqueTopBrands && filterTopBrands.length !== uniqueTopBrands.length) {
      throw new NotFoundException("One or more Top Brands were Not Found");
    }

    if (categoryName) {
      const category = await this._categoryModel.findOne({
        filter: { categoryName: categoryName.toLowerCase() },
      });

      if (category && category._id.toString() !== categoryId) {
        throw new ConflictException("Category Name Already Exists");
      }
    }

    await this._categoryModel.updateOne({
      filter: { _id: categoryId },
      update: {
        ...(categoryName && { categoryName: categoryName.toLowerCase() }),
        ...(categoryDescription && { categoryDescription }),
        ...(brands && { brands: uniqueBrands }),
        ...(topBrands && { topBrands: uniqueTopBrands }),
        ...(keys && { categoryImage: keys }),
        updatedAt: new Date(Date.now()),
        $inc: { __v: 1 },
      },
    });

    return res.status(200).json({ message: "Category Updated Successfully" });
  };
}
export default new categoryServices();

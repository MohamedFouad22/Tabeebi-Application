import { Request, Response } from "express";
import { createProductDTO } from "./product.dto";
import { ProductRepository } from "../../DB/Repositories/product.repository";
import { productModel } from "../../DB/Models/product.model";
import { BrandRepository } from "../../DB/Repositories/brand.repository";
import { brandModel } from "../../DB/Models/brand.model";
import { CategoryRepository } from "../../DB/Repositories/category.repository";
import { categoryModel } from "../../DB/Models/category.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import {
  deleteFiles,
  uploadFiles,
} from "../../Utils/Multer/aws.services.utils";

class ProductServices {
  private _productModel = new ProductRepository(productModel);
  private _brandModel = new BrandRepository(brandModel);
  private _categoryModel = new CategoryRepository(categoryModel);
  constructor() {}

  createProduct = async (req: Request, res: Response): Promise<Response> => {
    const {
      productName,
      overview,
      brand,
      category,
      originalPrice,
      discountPercentage,
      stock,
      sold,
    }: createProductDTO = req.body;

    const findBrand = await this._brandModel.findOne({
      filter: {
        _id: brand,
      },
    });
    if (!findBrand) {
      throw new NotFoundException("Brand Not Found");
    }

    const findCategory = await this._categoryModel.findOne({
      filter: {
        _id: category,
      },
    });
    if (!findCategory) {
      throw new NotFoundException("Category Not Found");
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new BadRequestException("Product Images Are Required");
    }

    const urls = await uploadFiles({
      path: `Product/Product Images/${req.decoded._id}`,
      files,
    });

    try {
      const [product] = await this._productModel.create({
        data: [
          {
            productName,
            overview,
            brand,
            category,
            originalPrice,
            discountPercentage,
            stock,
            ...(sold && { sold }),
            createdBy: req.decoded._id,
            productImages: urls,
          },
        ],
      });
      if (!product) {
        await deleteFiles({
          urls,
        });
        throw new BadRequestException("Failed To Create Product");
      }

      return res
        .status(201)
        .json({ message: "Product Created Successfully", product });
    } catch (error) {
      await deleteFiles({ urls });
      throw error;
    }
  };
}
export default new ProductServices();

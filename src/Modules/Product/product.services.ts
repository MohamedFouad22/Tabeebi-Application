import { Request, Response } from "express";
import {
  createProductDTO,
  deleteProductDTO,
  getProductDto,
  updateProductDTO,
  updateProductParamsDTO,
} from "./product.dto";
import { ProductRepository } from "../../DB/Repositories/product.repository";
import { productModel } from "../../DB/Models/product.model";
import { BrandRepository } from "../../DB/Repositories/brand.repository";
import { brandModel } from "../../DB/Models/brand.model";
import { CategoryRepository } from "../../DB/Repositories/category.repository";
import { categoryModel } from "../../DB/Models/category.model";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Security/Error/global.error.utils";
import {
  deleteFiles,
  uploadFiles,
} from "../../Utils/Multer/aws.services.utils";
import { RoleEnum } from "../../Utils/Enum/enum.utils";

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

      return res.status(201).json({ message: "Product Created Successfully" });
    } catch (error) {
      await deleteFiles({ urls });
      throw error;
    }
  };

  getProducts = async (req: Request, res: Response): Promise<Response> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      this._productModel.find({
        projection: "-updatedAt -createdAt -__v",
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
          populate: [
            { path: "brand", select: "brandName createdBy" },
            { path: "category", select: "categoryName createdBy" },
          ],
        },
      }),
      this._productModel.countDocuments({ filter: {} }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      message: "Get Products Successfully",
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
      },
      products,
    });
  };

  getSpecificProduct = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { productId } = req.params as getProductDto;

    const product = await this._productModel.findOne({
      filter: { _id: productId },
      projection: "-updatedAt -createdAt -__v",
    });
    if (!product) throw new NotFoundException("Product Not Found");

    return res
      .status(200)
      .json({ message: "Get Product Successfully", product });
  };

  updateProduct = async (req: Request, res: Response): Promise<Response> => {
    const { productId } = req.params as updateProductParamsDTO;
    const {
      productName,
      overview,
      brand,
      category,
      originalPrice,
      discountPercentage,
      stock,
    }: updateProductDTO = req.body;

    const product = await this._productModel.findOne({
      filter: { _id: productId },
    });
    if (!product) throw new NotFoundException("Product Not Found");

    if (
      req.decoded.role === RoleEnum.ADMIN ||
      req.decoded._id === product.createdBy
    ) {
      let urls;
      if (Array.isArray(req.files) && req.files?.length > 0) {
        await deleteFiles({ urls: product.productImages });
        urls = await uploadFiles({
          path: `Product/Product Images/${req.decoded._id}`,
          files: req.files as Express.Multer.File[],
        });
      }

      const effectiveOriginalPrice = originalPrice ?? product.originalPrice;
      const effectiveDiscount =
        discountPercentage ?? product.discountPercentage;

      const finalPrice =
        effectiveOriginalPrice -
        (effectiveOriginalPrice * effectiveDiscount) / 100;

      await this._productModel.updateOne({
        filter: { _id: productId },
        update: {
          ...(productName && { productName }),
          ...(overview && { overview }),
          ...(brand && { brand }),
          ...(urls && { productImages: urls }),
          ...(category && { category }),
          originalPrice: effectiveOriginalPrice,
          discountPercentage: effectiveDiscount,
          priceAfterDiscount: finalPrice,
          ...(stock !== undefined && { stock }),
          $inc: { __v: 1 },
        },
      });
    } else {
      throw new ForbiddenException(
        "You Don't Have Permission To Update The Product",
      );
    }

    return res.status(200).json({ message: "Product Updated Successfully" });
  };

  deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    const { productId } = req.params as deleteProductDTO;

    const product = await this._productModel.findOne({
      filter: { _id: productId },
    });
    if (!product) throw new NotFoundException("Product Not Found");

    if (
      req.decoded.role === RoleEnum.ADMIN ||
      req.decoded._id === product?.createdBy
    ) {
      await deleteFiles({ urls: product.productImages });

      await this._productModel.deleteOne({ filter: { _id: productId } });
    } else {
      throw new ForbiddenException(
        "You Don't Have Permission To Delete The Product",
      );
    }

    return res.status(200).json({ message: "Product Deleted Successfully" });
  };
}
export default new ProductServices();

import {
  ApplyBasicCreateCasting,
  CreateOptions,
  DeepPartial,
  Model,
  MongooseBaseQueryOptions,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Require_id,
  UpdateQuery,
} from "mongoose";

export abstract class DateBaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  find = async ({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument> | null | undefined;
    options?: QueryOptions<TDocument>;
  }) => {
    return await this.model.find(filter, projection, options);
  };

  findOne = async ({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument> | null | undefined;
    options?: QueryOptions<TDocument> | null | undefined;
  }) => {
    return await this.model.findOne(filter, projection, options);
  };

  findById = async ({
    id,
    projection,
    options,
  }: {
    id?: any;
    projection?: ProjectionType<TDocument> | null | undefined;
    options?: QueryOptions<TDocument> | null;
  }) => {
    return await this.model.findById(id, projection, options);
  };

  findOneAndUpdate = async ({
    filter,
    update,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    update?: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }) => {
    return await this.model.findOneAndUpdate(filter, update, options);
  };

  findByIdUpdate = async ({
    id,
    update,
    options,
  }: {
    id?: any;
    update?: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }) => {
    return await this.model.findByIdAndUpdate(id, update, options);
  };

  create = async ({
    data,
    options,
  }: {
    data: Array<DeepPartial<ApplyBasicCreateCasting<Require_id<TDocument>>>>;
    options?: CreateOptions;
  }) => {
    return await this.model.create(data, options);
  };

  updateOne = async ({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument> | null;
  }) => {
    return await this.model.updateOne(filter, update, options);
  };

  deleteOne = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<TDocument>;
    options?: MongooseBaseQueryOptions<TDocument> | null;
  }) => {
    return await this.model.deleteOne(filter, options);
  };

  findOneAndDelete = async ({
    filter,
    options,
  }: {
    filter?: QueryFilter<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }) => {
    return await this.model.findOneAndDelete(filter, options);
  };
}

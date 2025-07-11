import { ClientSession, FilterQuery, Model, ObjectId } from 'mongoose';

class BaseService<EntityModel, Entity> {
  constructor(readonly model: Model<EntityModel>) {}

  /**
   * Counts all Entity Models
   *
   * @param query FilterQuery
   * @returns Promise<{count: number}>
   */
  async count(filter: FilterQuery<Entity>): Promise<{ count: number }> {
    const count = await this.model.countDocuments(filter);
    return { count };
  }

  /**
   * Finds Entity Model using Entity Id
   *
   * @param id ObjectId | string
   * @returns Promise<EntityModel>
   */
  async findById(id: ObjectId | string, options?: any): Promise<EntityModel> {
    let response = null;
    const findByIdPromise = this.model.findById(id, options?.fields || '');

    if (options?.toPopulate) {
      response = await findByIdPromise.populate(options.toPopulate);
    } else {
      response = await findByIdPromise;
    }

    // Return the response
    return response;
  }

  /**
   * Finds one Entity Model
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  async findOne(query: FilterQuery<Entity>, options?: any): Promise<EntityModel> {
    let response = null;
    const findOnePromise = this.model.findOne(query, options?.fields || '');

    if (options?.toPopulate) {
      response = await findOnePromise.populate(options.toPopulate);
    } else {
      response = await findOnePromise;
    }

    // Return the response
    return response;
  }

  /**
   * Finds all Entity Models
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  async findAll(filter: FilterQuery<Entity>, options?: any): Promise<{ rows: EntityModel[]; totalCount: number }> {
    // Prepare Sort Options
    const sortOptions = options?.sortBy ? options.sortBy : '-createdAt';

    // // Remove pagination Query strings from filter
    // delete filter?.limit;
    // delete filter?.page;
    // delete filter?.q;

    let findPromise = options?.toPopulate ? this.model.find(filter).populate(options.toPopulate).sort(sortOptions) : this.model.find(filter).sort(sortOptions);
    if (options?.query?.limit) {
      findPromise = findPromise.limit(options.query?.limit).skip((options.query?.page - 1) * options.query?.limit);
    }
    const [rows, totalCount] = await Promise.all([findPromise.select(options?.fields ? options.fields : ''), this.model.countDocuments(filter)]);

    return { rows, totalCount };
  }

  /**
   * Find All entities that match the given query filters
   *
   * @param query FilterQuery<Entity>
   * @param options IServiceOptions
   * @returns Promise<{ rows: EntityModel[] }
   */
  async find(query: FilterQuery<Entity>, options?: any): Promise<{ rows: EntityModel[] }> {
    let responsePromise = null;

    if (options?.toPopulate) {
      responsePromise = this.model.find(query).populate(options.toPopulate);
    } else {
      responsePromise = this.model.find(query);
    }

    const rows = await responsePromise.select(options?.fields ? options.fields : '');

    return { rows };
  }

  /**
   * Create a Entity Document
   *
   * @param data Document Data
   * @returns Promise<EntityModel>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Entity, session: ClientSession, options?: any): Promise<EntityModel> {
    const document = new this.model(data);
    const newDoc = await document.save({ session });

    return newDoc as EntityModel;
  }

  /**
   * Updates the document
   *
   * @param id
   * @param body
   * @param session
   * @param options
   * @returns Promise<EntityModel>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: string, body: Partial<Entity>, session?: ClientSession, options?: any): Promise<EntityModel> {
    return await this.model.findOneAndUpdate({ _id: id }, body, { new: true, lean: true, session });
  }

  /**
   * Updates all Jobs for given query
   *
   * @param query any
   * @param data any
   * @param session ClientSession
   * @returns Promise<any>
   */
  async updateMany(query: any, data: any, session: ClientSession): Promise<any> {
    return await this.model.updateMany(query, { $set: data }, { session });
  }

  /**
   * Removes the given entity completely from database.
   *
   * @param id String
   * @param session ClientSession
   * @returns Promise<boolean>
   */
  async remove(id: string, session: ClientSession): Promise<boolean> {
    const resource = await this.model.findById({ _id: id });

    if (!resource) throw new Error('Entity Model not found');

    await resource.remove({ session });

    return true;
  }

  /**
   * Marks the entity as deleted without removing it completely.
   *
   * @param id String
   * @param session ClientSession
   * @param options IServiceOptions<Optional>
   * @returns Promise<EntityModel>
   */
  async softDelete(id: string, session: ClientSession): Promise<EntityModel> {
    return await this.model.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true, lean: true, session });
  }
}

export default BaseService;

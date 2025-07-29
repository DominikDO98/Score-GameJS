import mongoose from "mongoose";
import type { Connection } from "mongoose";
import { MongoConnectionManager } from "./connectionManager.js";

export class MongoRepository {
  private _connection: Connection | null;
  constructor(mongo: MongoConnectionManager) {
    this._connection = mongo.conn.connection;
  }
  async save(data: Object, schema: mongoose.Schema, modelName: string) {
    return await this._connection?.model(modelName, schema).create(data);
  }
  async getHighestGlobal(schema: mongoose.Schema, modelName: string) {
    return await this._connection
      ?.model(modelName, schema)
      .find()
      .sort({ score: -1 })
      .limit(10);
  }
  async getHighestForPlayer(
    schema: mongoose.Schema,
    modelName: string,
    userId: string
  ) {
    return await this._connection
      ?.model(modelName, schema)
      .find({ userId: userId })
      .sort({ score: -1 })
      .limit(10);
  }
}

import "dotenv/config";
import mongoose from "mongoose";
import type { Connection } from "mongoose";
import { logger } from "../../lib/logger/logger.js";
import { ValidationError } from "../../lib/errors/validationError.js";

export class MongoConnection {
  private _connection: Connection | null = null;

  get connection() {
    return this._connection;
  }
  async init() {
    return mongoose
      .connect(process.env.MONGODB_URI, { maxPoolSize: 10 })
      .then((mongo) => {
        this._connection = mongo.connection.useDb(process.env.MONGODB_DB);
        if (this._connection.readyState === 1) {
          logger.log(
            "Connection to mongo database established...",
            "Mongo Connection"
          );
        }
        if (this._connection.readyState !== 1) {
          throw new ValidationError("No connection to database established...");
        }
        return this._connection;
      })
      .catch((e) => {
        console.log(process.env.MONGODB_URI);

        logger.error(e as string, "Mongo Connection", true);
      });
  }
  validateConnection() {
    if (!this._connection || this._connection.readyState !== 1) {
      throw new ValidationError("No connection to mongo database");
    }
  }
  getState() {
    return this._connection?.readyState;
  }
  async disconnect() {
    return mongoose
      .disconnect()
      .then(() => {
        this._connection = null;
        logger.log("Disconnected from DB", "MongoConnection.diconnect");
      })
      .catch((e) => {
        logger.error(e as string, "MonogoConnection.disconnect", true);
      });
  }
}

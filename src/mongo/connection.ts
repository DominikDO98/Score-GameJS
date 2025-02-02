import "dotenv/config";
import mongoose, { Connection } from "mongoose";

export class MongoConnection {
  private _connection: Connection | null = null;

  set connection(connection: Connection | null) {
    this._connection = connection;
  }
  get connection(): Connection | null {
    return this._connection;
  }

  async init() {
    return mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongo) => {
        this.connection = mongo.connection.useDb(process.env.MONGODB_DB);
        console.log("Connection to mongo database established...");
      })
      .catch((e) => {
        console.error("Cannot connect! Aborting...", e);
      });
  }

  async disconnect() {
    return mongoose
      .disconnect()
      .then(() => {
        this.connection = null;
        console.log("Disconnected from DB");
      })
      .catch((e) => {
        console.error("Can't disconnect from mongo server", e);
      });
  }
}

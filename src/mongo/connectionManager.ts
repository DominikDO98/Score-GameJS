import { logger } from "../../lib/logger/logger.js";
import { MongoConnection } from "./connection.js";

export class MongoConnectionManager {
  public isAlive: boolean = false;
  private _conn: MongoConnection;

  get conn() {
    return this._conn;
  }

  constructor() {
    this._conn = new MongoConnection();
  }
  async init() {
    try {
      this._conn.init();
    } catch (err) {
      logger.error(err as string, "Mongo Controller", true);
    }
  }
  private checkConnection() {
    if (this._conn.getState() === 1) {
      this.isAlive = true;
    }
    if (this._conn.getState() !== 1) {
      this.isAlive = false;
    }
  }
  reconnect() {
    setInterval(() => {
      this.checkConnection();
      if (!this.isAlive) {
        this._conn.init();
      }
    }, 5000);
  }
}

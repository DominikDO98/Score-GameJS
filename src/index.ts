import { ScoreController } from "./controllers/score.controller.js";
import { MongoConnectionManager } from "./mongo/connectionManager.js";
import { RpcConnectionManager } from "../lib/broker/connectionManager.js";
import { logger } from "../lib/logger/logger.js";

class App {
  private _broker = new RpcConnectionManager();
  private _mongo = new MongoConnectionManager();
  async init() {
    try {
      await this._mongo.init();
      await this._broker.init();
      new ScoreController(this._broker, this._mongo).initQs();
    } catch (err) {
      logger.error(err as string, "App.init", true);
    }
    this._mongo.reconnect();
    this._broker.reconnect();
  }
}
new App().init();

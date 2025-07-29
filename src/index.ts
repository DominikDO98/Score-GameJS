import { ScoreController } from "controllers/score.controller";
import { MongoConnectionManager } from "mongo/connectionManager";
import { RpcConnectionManager } from "../lib/src/broker/connectionManager";
import { logger } from "../lib/src/logger/logger";

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

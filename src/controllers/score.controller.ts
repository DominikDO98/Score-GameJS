import type { ConsumeMessage } from "amqplib";
import { EQueues } from "../enums/queues.js";
import { MongoConnectionManager } from "../mongo/connectionManager.js";
import { ScoreService } from "../services/score.service.js";
import { RpcConnectionManager } from "../../lib/broker/connectionManager.js";
import { logger } from "../../lib/logger/logger.js";

export class ScoreController {
  private _service: ScoreService;
  private _broker: RpcConnectionManager;
  constructor(broker: RpcConnectionManager, mongo: MongoConnectionManager) {
    this._broker = broker;
    this._service = new ScoreService(mongo);
  }
  initQs() {
    if (this._broker.isAlive) {
      this.route(EQueues.Score, this.saveScore);
      this.route(EQueues.Leaderboard, this.getLeaderboard);
      this.route(EQueues.PerosonalBest, this.getPersonalHighest);
    }
    if (!this._broker.isAlive)
      setTimeout(() => {
        this.initQs();
      }, 1000);
  }
  private async route(
    queue: string,
    callback: (replyQ: string, msg: ConsumeMessage | null) => Promise<void>
  ) {
    this._broker.listenQ(queue, callback.bind(this), "Score Controller");
  }
  async saveScore(replyQ: string, msg: ConsumeMessage | null): Promise<void> {
    try {
      const res = await this._service.saveScore(msg);
      const id = msg?.properties.correlationId;
      await this._broker.replyCall(replyQ, JSON.stringify(res), id);
      return;
    } catch (err) {
      logger.error(err as string, "Score Controller");
      return;
    }
  }
  async getPersonalHighest(
    replyQ: string,
    msg: ConsumeMessage | null
  ): Promise<void> {
    try {
      const top10 = await this._service.getHighestForPlayer(msg);
      const id = msg?.properties.correlationId;
      await this._broker.replyCall(replyQ, JSON.stringify(top10), id);
      return;
    } catch (err) {
      logger.error(err as string, "Score Controller");
      return;
    }
  }
  async getLeaderboard(
    replyQ: string,
    msg: ConsumeMessage | null
  ): Promise<void> {
    try {
      const top10 = await this._service.getLeaderboard();
      const id = msg?.properties.correlationId;
      await this._broker.replyCall(replyQ, JSON.stringify(top10), id);
      return;
    } catch (err) {
      logger.error(err as string, "Score Controller");
      return;
    }
  }
}

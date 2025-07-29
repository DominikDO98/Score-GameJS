import { ConsumeMessage } from "amqplib";
import { EQueues } from "enums/queues";
import { MongoConnectionManager } from "mongo/connectionManager";
import { ScoreService } from "services/score.service";
import { RpcConnectionManager } from "../../lib/src/broker/connectionManager";
import { logger } from "../../lib/src/logger/logger";

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
      this._broker.replyCall(replyQ, JSON.stringify(res));
    } catch (err) {
      logger.error(err as string, "Score Controller");
      this._broker.replyCall(replyQ, JSON.stringify("error"));
    }
  }
  async getPersonalHighest(
    replyQ: string,
    msg: ConsumeMessage | null
  ): Promise<void> {
    try {
      const top10 = await this._service.getHighestForPlayer(msg);
      this._broker.replyCall(replyQ, JSON.stringify(top10));
    } catch (err) {
      logger.error(err as string, "Score Controller");
      this._broker.replyCall(replyQ, JSON.stringify("error"));
    }
  }
  async getLeaderboard(
    replyQ: string,
    _msg: ConsumeMessage | null
  ): Promise<void> {
    try {
      const top10 = await this._service.getLeaderboard();
      this._broker.replyCall(replyQ, JSON.stringify(top10));
    } catch (err) {
      logger.error(err as string, "Score Controller");
      this._broker.replyCall(replyQ, JSON.stringify("error"));
    }
  }
}

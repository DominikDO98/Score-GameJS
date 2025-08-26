import type { ConsumeMessage } from "amqplib";
import { logger } from "../logger/logger.js";
import { RpcConnection } from "./connection.js";
import { RpcRepository } from "./repository.js";

export class RpcConnectionManager {
  public isAlive: boolean = false;
  private _conn: RpcConnection;
  private _repo: RpcRepository;

  get conn() {
    return this._conn;
  }
  constructor() {
    this._conn = new RpcConnection();
    this._repo = new RpcRepository(this._conn);
  }
  async init() {
    try {
      await this._conn.init();
      await this.checkConnection();
      if (this.isAlive)
        logger.log("Broker initialization is over...", "Rpc Menager", false);
    } catch (err) {
      logger.error(err as string, "Rpc Menager", true);
    }
  }
  async listenQ(
    queue: string,
    callback: (
      replyQueue: string,
      msg: ConsumeMessage | null
    ) => Promise<void> | void,
    controller: string
  ) {
    try {
      await this._repo.listenQ(queue, callback).then(() => {
        logger.log(
          `Route for ${callback.name.split(" ")[1]} has been established`,
          controller,
          false
        );
      });
    } catch (err) {
      logger.error(err as string, "Rpc Menager", true);
    }
  }
  async sendCall(
    queue: string,
    msg: string,
    callback: (reply: ConsumeMessage | null) => unknown
  ) {
    try {
      return await this._repo.sendCall(queue, msg, callback);
    } catch (err) {
      logger.error(err as string, "Rpc Menager", true);
      return null;
    }
  }
  async replyCall(replyQueue: string, msg: string, msgId: string) {
    try {
      await this._repo.replyCall(replyQueue, msg, msgId);
    } catch (err) {
      logger.error(err as string, "Rpc Menager", true);
    }
  }
  private async checkConnection() {
    try {
      this._conn.validateConnection();
      const q = "checkHealth";
      if (this._conn.channel && this._conn.connection) {
        await this._conn.channel?.assertQueue(q);
        this.isAlive = (await this._conn.channel?.checkQueue(q)) ? true : false;
      }
    } catch (error) {
      logger.warn(error as string, "RPC Manager: Connection checking", true);
      this._conn.disconnect();
      this.isAlive = false;
    }
    return this.isAlive;
  }
  reconnect() {
    setInterval(async () => {
      await this.checkConnection();
      if (!this.isAlive) {
        this.init();
      }
    }, Number(process.env.TIMEOUT) || 3600000);
  }
  disconnect() {
    return this._conn.disconnect();
  }
}

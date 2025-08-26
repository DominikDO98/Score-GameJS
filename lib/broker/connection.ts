import type { Channel, ChannelModel } from "amqplib";
import { connect } from "amqplib";
import "dotenv/config";
import { ValidationError } from "../errors/validationError.js";
import { logger } from "../logger/logger.js";

export class RpcConnection {
  private _connection: ChannelModel | null = null;
  private _channel: Channel | null = null;

  get connection(): ChannelModel | null {
    return this._connection;
  }
  get channel(): Channel | null {
    return this._channel;
  }

  async init() {
    this._connection = await connect(process.env.RABBITMQ_URL);
    this._channel = await this._connection.createChannel();
    this._channel.prefetch(1);
    this.validateConnection();
    this._channel?.on("close", () => {
      this._channel = null;
      this._connection = null;
    });
    this._channel?.on("error", () => {
      this.disconnect();
      this._channel = null;
      this._connection = null;
    });
  }
  async disconnect() {
    try {
      this.validateConnection();
      await this._channel?.close();
      await this._connection?.close();
      this._channel = null;
      this._connection = null;
    } catch (err) {
      logger.warn(err as string, "Rpc connection", false);
      this._channel = null;
      this._connection = null;
    }
  }
  validateConnection() {
    if (!this._connection) throw new ValidationError("No connection!");
    if (!this._channel) throw new ValidationError("No channel!");
  }
}

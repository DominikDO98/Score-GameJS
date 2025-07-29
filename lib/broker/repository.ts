import type { Channel, ConsumeMessage } from "amqplib";
import { randomUUID } from "crypto";
import { logger } from "../logger/logger.js";
import { RpcConnection } from "./connection.js";

export class RpcRepository {
  private _conn: RpcConnection;

  constructor(connection: RpcConnection) {
    this._conn = connection;
  }

  async listenQ(
    queue: string,
    callback: (
      replyQueue: string,
      msg: ConsumeMessage | null
    ) => Promise<void> | void
  ) {
    this._conn.validateConnection();
    const channel: Channel = this._conn.channel!;
    await channel.assertQueue(queue);
    await channel.prefetch(1);
    await channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        logger.log(msg.content.toString(), "Rpc Repository");
        const replyQ = msg.properties.replyTo;
        await callback(replyQ, msg);
        channel.ack(msg);
      } catch (err) {
        logger.error(err as string, "Rpc Repository");
        if (msg) channel.nack(msg);
      }
    });
  }
  async sendCall(
    queue: string,
    msg: string,
    callback: (reply: ConsumeMessage | null) => void
  ) {
    this._conn.validateConnection();
    const channel: Channel = this._conn.channel!;
    const correlationId = randomUUID();
    await channel.assertQueue(queue);
    const replyQ = await channel.assertQueue("", {
      exclusive: true,
      expires: 10000,
      messageTtl: 5000,
    });
    return new Promise((resolve, reject) => {
      const consumerTag = randomUUID();
      const timer = setTimeout(() => {
        channel.cancel(consumerTag).catch((e) => {
          logger.error(e as string, "RPC Repository", true);
        });
        reject(new Error("No msg recived after 3 seconds"));
      }, 3000);
      const onReply = (replyMsg: ConsumeMessage | null) => {
        if (replyMsg?.properties.correlationId === correlationId) {
          clearTimeout(timer);
          channel.ack(replyMsg!);
          try {
            const result = callback(replyMsg);
            resolve(result);
          } catch (e) {
            logger.error(e as string, "RPC Repository", true);
            reject(e);
          }
        }
      };
      channel.consume(replyQ.queue, onReply, {
        consumerTag: consumerTag,
      });
      channel.sendToQueue(queue, Buffer.from(msg), {
        correlationId: correlationId,
        replyTo: replyQ.queue,
      });
    });
  }
  async replyCall(replyQueue: string, msg: string, msgId: string) {
    this._conn.validateConnection();
    const channel: Channel = this._conn.channel!;
    channel.sendToQueue(replyQueue, Buffer.from(msg), {
      correlationId: msgId,
    });
  }
}

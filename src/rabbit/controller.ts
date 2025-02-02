import { ConsumeMessage } from "amqplib";
import { RabbitConnection } from "./connection";

export class RabbitController {
  private _rabbit = new RabbitConnection();

  async linstenQ(
    queue: string,
    replyQueue: string,
    callback: (msg: ConsumeMessage | null) => void
  ) {
    this._rabbit.valitadeConnection();
    this._rabbit.channel?.assertQueue(queue);
    this._rabbit.channel?.assertQueue(replyQueue);
    this._rabbit.channel?.prefetch(1);

    this._rabbit.channel?.consume(queue, (msg) => {
      if (!msg) throw Error("No message!");
      console.log("Got a message ", msg?.content.toString());
      callback(msg);
      this._rabbit.channel?.ack(msg);
    });
  }

  async sendCall(
    queue: string,
    replyQueue: string,
    msg: string,
    callback: (reply: string) => void
  ) {
    this._rabbit.valitadeConnection();
    await this._rabbit.channel
      ?.assertQueue(queue)
      .then(async () => {
        await this._rabbit.channel?.assertQueue(replyQueue);
        return this._rabbit.channel?.sendToQueue(queue, Buffer.from(msg));
      })
      .then(async (send) => {
        if (!send) throw Error("Sending a msg was unsuccesful!");
        console.log("Msg send");
        await this._rabbit.channel?.consume(replyQueue, (replyMsg) => {
          if (!replyMsg) throw Error("No msg!");
          console.log("Resoponse recived", replyMsg);
          callback(String(replyMsg.content));
          this._rabbit.channel?.ack(replyMsg!);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

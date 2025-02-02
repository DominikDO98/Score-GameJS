import { Channel, connect, Connection } from "amqplib";

export class RabbitConnection {
  private _connection: Connection | null = null;
  private _channel: Channel | null = null;

  get connection(): Connection | null {
    return this._connection;
  }

  get channel(): Channel | null {
    return this._channel;
  }

  async init() {
    await connect("amqp://localhost:5672")
      .then((conn) => {
        console.log("Establishing connection...");
        this._connection = conn;
        return this._connection.createChannel();
      })
      .then((chan) => {
        console.log("Creating channel...");
        this._channel = chan;
        console.log("Connection: ", this._connection);
        console.log("Channel: ", this._channel);
        this.valitadeConnection();
        return [this._connection, this._channel];
      })
      .catch((e) => {
        console.log("Something went wrong");
        console.error(e);
      })
      .finally(() => console.log("Broker initialization is over"));
  }

  disconnect() {
    this.valitadeConnection();
    try {
      this._channel!.close();
      this._connection!.close();
    } catch (e) {
      console.error("Unable to disconnect from Message Broker!", e);
    }
  }

  valitadeConnection() {
    if (!this._connection) throw Error("No connection!");
    if (!this._channel) throw Error("No channel!");
  }
}

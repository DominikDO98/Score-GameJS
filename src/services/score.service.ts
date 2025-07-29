import { ConsumeMessage } from "amqplib";
import { ScoreDO } from "DO/scoreDO";
import { MongoConnectionManager } from "mongo/connectionManager";
import { MongoRepository } from "mongo/repository";
import { scoreSchema } from "mongo/schmas";
import { ValidationError } from "../../lib/src/errors/validationError";
import { TMessageSchema as TMessageSchema } from "../../lib/src/rpcValidator/types/rpcValidator";
import { RPCValidator } from "../../lib/src/rpcValidator/rpcValidator";
import { logger } from "../../lib/src/logger/logger";

const scoreMessageSchema: TMessageSchema = {
  score: {
    type: "number",
    required: true,
  },
  userId: {
    type: "number",
    required: true,
  },
  username: {
    type: "string",
    required: true,
  },
  avatarUrl: {
    type: "string",
    required: true,
  },
};
export class ScoreService {
  private _mongo: MongoConnectionManager;
  private _repository: MongoRepository;
  private _rpcValidator: RPCValidator;
  constructor(mongo: MongoConnectionManager) {
    this._mongo = mongo;
    this._repository = new MongoRepository(mongo);
    this._rpcValidator = new RPCValidator();
  }
  async saveScore(msg: ConsumeMessage | null) {
    await this.validate(msg, scoreMessageSchema);
    const { score, userId, username, avatarUrl } = JSON.parse(
      msg!.content.toString()
    );
    const scoreDO = new ScoreDO(score, userId, username, avatarUrl);
    const result = await this._repository.save(scoreDO, scoreSchema, "score");
    return result;
  }
  async getHighestForPlayer(msg: ConsumeMessage | null) {
    const { userId } = JSON.parse(msg!.content.toString());
    return await this._repository.getHighestForPlayer(
      scoreSchema,
      "score",
      userId
    );
  }
  async getLeaderboard() {
    const res = await this._repository.getHighestGlobal(scoreSchema, "score");
    console.log(res);
    return res;
  }
  private async validate(msg: ConsumeMessage | null, schema: TMessageSchema) {
    if (!msg) throw new ValidationError("No message recived");
    if (!this._mongo.isAlive)
      throw new ValidationError("No connection to MongoDB");
    const errors = this._rpcValidator.validateMessage(schema, msg);
    if (errors) {
      logger.error(`${errors.join("\n")}`, "RPC Validation", true);
      throw new ValidationError("Massege hasn't past schema validation");
    }
  }
}

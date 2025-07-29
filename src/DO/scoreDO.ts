import { IScoreDO } from "types/score";

export class ScoreDO implements IScoreDO {
  public score: number;
  public userId: number;
  public username: string;
  public avatarUrl: string;

  constructor(
    score: number,
    userId: number,
    username: string,
    avatarUrl: string
  ) {
    this.score = score;
    this.userId = userId;
    this.username = username;
    this.avatarUrl = avatarUrl;
  }
}

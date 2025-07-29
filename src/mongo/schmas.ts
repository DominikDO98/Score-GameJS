import { Schema } from "mongoose";

export const scoreSchema = new Schema({
  userId: Number,
  score: Number,
  username: String,
  avatarUrl: String,
});

import { Schema } from "mongoose";

export const scoreSchema = new Schema({
  userId: Schema.ObjectId,
  score: Number,
});

export const userSchema = new Schema({
  username: String,
});

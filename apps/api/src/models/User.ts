import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  org: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default model("User", userSchema);

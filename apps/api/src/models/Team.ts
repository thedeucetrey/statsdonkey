import { Schema, model, Types } from "mongoose";

const teamSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", index: true },
  name: { type: String, required: true },
  division: String,
  color: String,
  roster: [{ type: Types.ObjectId, ref: "Player" }],
  staff: {
    coach: String,
    assistant: String
  },
  season: { type: String, default: new Date().getFullYear().toString() }
}, { timestamps: true });

export default model("Team", teamSchema);

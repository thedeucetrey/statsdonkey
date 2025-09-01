import { Schema, model, Types } from "mongoose";

const paSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", index: true },
  gameId:  { type: Types.ObjectId, ref: "Game", index: true },
  teamId:  { type: Types.ObjectId, ref: "Team", index: true },
  batterId:{ type: Types.ObjectId, ref: "Player", index: true },
  inning: Number,
  half: { type: String, enum: ["top","bottom"], default: "top" },
  order: Number, // sequence within game
  countStart: { type: String, default: "0-0" },
  countEnd:   { type: String, default: "0-0" },
  runners:    { type: String, default: "---" }, // '---','1--','-2-','--3','12-','1-3','-23','123'
  result:     { type: String, enum: ["1B","2B","3B","HR","BB","K","OUT","SAC","ROE","FC"], default: "OUT" },
  rbi: { type: Number, default: 0 },
  runScored: { type: Boolean, default: false },
  hitLoc: String, // free text or zoned id
  notes: String
}, { timestamps: true });

export default model("PlateAppearance", paSchema);

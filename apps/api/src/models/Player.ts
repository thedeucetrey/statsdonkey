import { Schema, model, Types } from "mongoose";

const cum = {
  g: { type: Number, default: 0 }, pa: { type: Number, default: 0 }, ab: { type: Number, default: 0 },
  h: { type: Number, default: 0 }, _1b: { type: Number, default: 0 }, _2b: { type: Number, default: 0 }, _3b: { type: Number, default: 0 }, hr: { type: Number, default: 0 },
  bb: { type: Number, default: 0 }, k: { type: Number, default: 0 }, rbi: { type: Number, default: 0 }, r: { type: Number, default: 0 }, sb: { type: Number, default: 0 }, sac: { type: Number, default: 0 }, roe: { type: Number, default: 0 }
};

const playerSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", index: true },
  teamId: { type: Types.ObjectId, ref: "Team", index: true },
  firstName: String,
  lastName: String,
  throwing: { type: String, enum: ["R","L","S"], default: "R" },
  batting: { type: String, enum: ["R","L","S"], default: "R" },
  number: Number,
  positions: [String],
  profileImg: String,
  notes: String,
  totals: {
    career: cum,
    season: cum,
    tournament: cum,
    game: cum
  }
}, { timestamps: true });

export default model("Player", playerSchema);

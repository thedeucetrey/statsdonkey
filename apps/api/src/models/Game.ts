import { Schema, model, Types } from "mongoose";

const lineupSpot = new Schema({ playerId: { type: Types.ObjectId, ref: "Player" }, pos: String }, { _id: false });

const gameSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", index: true },
  teamId: { type: Types.ObjectId, ref: "Team", required: true },
  opponent: { type: String, required: true },
  opponentId: { type: Types.ObjectId, ref: "OpponentProfile" },
  date: { type: Date, default: Date.now },
  location: String,
  isTournament: { type: Boolean, default: false },
  lineup: [lineupSpot],
  opponentLineup: [lineupSpot],
  innings: { type: Number, default: 7 },
  score: {
    us: { type: Number, default: 0 },
    them: { type: Number, default: 0 }
  },
  status: { type: String, enum: ["scheduled","in_progress","final"], default: "scheduled" }
}, { timestamps: true });

export default model("Game", gameSchema);

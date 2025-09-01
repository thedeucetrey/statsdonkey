import { Schema, model, Types } from "mongoose";

// Track opponent hitters: spray by zone and situation
const zone = new Schema({
  z: String, // e.g., 'LF shallow', 'CF deep', numbered 1..9 etc.
  count: { type: Number, default: 0 }
}, { _id: false });

const countSplit = new Schema({
  c: String, // e.g., '0-0','1-2','3-1'
  results: {
    _1b: { type: Number, default: 0 }, _2b: { type: Number, default: 0 }, _3b: { type: Number, default: 0 },
    hr: { type: Number, default: 0 }, bb: { type: Number, default: 0 }, k: { type: Number, default: 0 },
    out: { type: Number, default: 0 }, roe: { type: Number, default: 0 }, sac: { type: Number, default: 0 }
  }
}, { _id: false });

const runnerState = new Schema({
  r: String, // e.g., '---','1--','-2-','12-','1-3','123'
  results: {
    _1b: { type: Number, default: 0 }, _2b: { type: Number, default: 0 }, _3b: { type: Number, default: 0 },
    hr: { type: Number, default: 0 }, bb: { type: Number, default: 0 }, k: { type: Number, default: 0 },
    out: { type: Number, default: 0 }, roe: { type: Number, default: 0 }, sac: { type: Number, default: 0 }
  }
}, { _id: false });

const opponentSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", index: true },
  name: { type: String, required: true },
  hitters: [{
    name: String,
    notes: String,
    spray: [zone],
    byCount: [countSplit],
    byRunners: [runnerState]
  }]
}, { timestamps: true });

export default model("OpponentProfile", opponentSchema);

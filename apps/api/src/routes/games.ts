import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Game from "../models/Game.js";
import PlateAppearance from "../models/PlateAppearance.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const games = await Game.find({ ownerId: (req as any).userId }).sort({ date: -1 });
  res.json(games);
});

r.post("/", async (req, res) => {
  const g = await Game.create({ ...req.body, ownerId: (req as any).userId });
  res.json(g);
});

r.get("/:id", async (req, res) => {
  const g = await Game.findOne({ _id: req.params.id, ownerId: (req as any).userId });
  if (!g) return res.status(404).json({ error: "Not found" });
  const pas = await PlateAppearance.find({ gameId: g._id }).sort({ order: 1 });
  res.json({ game: g, plateAppearances: pas });
});

r.put("/:id", async (req, res) => {
  const g = await Game.findOneAndUpdate({ _id: req.params.id, ownerId: (req as any).userId }, req.body, { new: true });
  if (!g) return res.status(404).json({ error: "Not found" });
  res.json(g);
});

export default r;

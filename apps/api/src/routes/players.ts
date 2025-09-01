import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Player from "../models/Player.js";
const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const players = await Player.find({ ownerId: (req as any).userId });
  res.json(players);
});

r.post("/", async (req, res) => {
  const p = await Player.create({ ...req.body, ownerId: (req as any).userId });
  res.json(p);
});

r.get("/:id", async (req, res) => {
  const p = await Player.findOne({ _id: req.params.id, ownerId: (req as any).userId });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

r.put("/:id", async (req, res) => {
  const p = await Player.findOneAndUpdate({ _id: req.params.id, ownerId: (req as any).userId }, req.body, { new: true });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

export default r;

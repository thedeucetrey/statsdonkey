import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const teams = await Team.find({ ownerId: (req as any).userId });
  res.json(teams);
});

r.post("/", async (req, res) => {
  const team = await Team.create({ ...req.body, ownerId: (req as any).userId });
  res.json(team);
});

r.get("/:id", async (req, res) => {
  const team = await Team.findOne({ _id: req.params.id, ownerId: (req as any).userId }).populate("roster");
  if (!team) return res.status(404).json({ error: "Not found" });
  res.json(team);
});

r.put("/:id", async (req, res) => {
  const team = await Team.findOneAndUpdate({ _id: req.params.id, ownerId: (req as any).userId }, req.body, { new: true });
  if (!team) return res.status(404).json({ error: "Not found" });
  res.json(team);
});

r.post("/:id/roster", async (req, res) => {
  const { playerId } = req.body;
  const team = await Team.findOne({ _id: req.params.id, ownerId: (req as any).userId });
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (!team.roster.find((p: any) => p.toString() === playerId)) team.roster.push(playerId);
  await team.save();
  res.json(team);
});

r.get("/:id/roster", async (req, res) => {
  const players = await Player.find({ teamId: req.params.id, ownerId: (req as any).userId });
  res.json(players);
});

export default r;

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import OpponentProfile from "../models/OpponentProfile.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const list = await OpponentProfile.find({ ownerId: (req as any).userId });
  res.json(list);
});

r.post("/", async (req, res) => {
  const o = await OpponentProfile.create({ ...req.body, ownerId: (req as any).userId });
  res.json(o);
});

r.get("/:id", async (req, res) => {
  const o = await OpponentProfile.findOne({ _id: req.params.id, ownerId: (req as any).userId });
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json(o);
});

r.put("/:id", async (req, res) => {
  const o = await OpponentProfile.findOneAndUpdate({ _id: req.params.id, ownerId: (req as any).userId }, req.body, { new: true });
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json(o);
});

export default r;

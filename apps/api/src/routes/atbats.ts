import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import PlateAppearance from "../models/PlateAppearance.js";

const r = Router();
r.use(requireAuth);

r.post("/", async (req, res) => {
  const body = { ...req.body, ownerId: (req as any).userId };
  const count = await PlateAppearance.countDocuments({ gameId: body.gameId });
  body.order = count + 1;
  const pa = await PlateAppearance.create(body);
  res.json(pa);
});

r.get("/by-game/:gameId", async (req, res) => {
  const list = await PlateAppearance.find({ gameId: req.params.gameId, ownerId: (req as any).userId }).sort({ order: 1 });
  res.json(list);
});

export default r;

import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const r = Router();

r.post("/signup",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").isLength({ min: 1 }),
  async (req, res) => {
    const v = validationResult(req);
    if (!v.isEmpty()) return res.status(400).json({ errors: v.array() });
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = jwt.sign({ uid: user._id.toString() }, process.env.JWT_SECRET || "dev", { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  }
);

r.post("/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const v = validationResult(req);
    if (!v.isEmpty()) return res.status(400).json({ errors: v.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ uid: user._id.toString() }, process.env.JWT_SECRET || "dev", { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  }
);

export default r;

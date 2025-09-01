import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connect } from "./db.js";

import auth from "./routes/auth.js";
import teams from "./routes/teams.js";
import players from "./routes/players.js";
import games from "./routes/games.js";
import atbats from "./routes/atbats.js";
import opponents from "./routes/opponents.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", auth);
app.use("/teams", teams);
app.use("/players", players);
app.use("/games", games);
app.use("/atbats", atbats);
app.use("/opponents", opponents);

const PORT = Number(process.env.PORT || 4001);

connect(process.env.MONGODB_URI || "mongodb://localhost:27017/statsdonkey")
  .then(() => {
    app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("DB error:", err);
    process.exit(1);
  });

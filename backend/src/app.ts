import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { closePool } from "./db";

import todoRoutes from "./routes/todo";
import authRoutes from "./routes/auth";

import type { Request, Response } from "express";
import { verifyToken } from "./jwt";
import path from "path";

dotenv.config();

const frontURL = process.env.FRONT_URL || "http://localhost:5173";
const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(
  cors({
    origin: frontURL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/todos", verifyToken, todoRoutes);
app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(staticDir));
  app.get("/{*splat}", (_, res) =>
    res.sendFile(path.join(staticDir, "index.html"))
  );
}

app.use((req: Request, res: Response) => {
  res.status(404).set("Content-Type", "text/html; charset=utf-8");
  res.send("<h1>ページが見つかりませんでした。</h1>");
});

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
    await closePool();
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log("Webサーバーが起動しました。");
});

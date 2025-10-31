import { Request, Response, Router } from "express";
import { exec, query } from "../db";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../jwt";

interface User {
  id: number;
  email: string;
  password: string;
}

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email.trim() || !password.trim()) {
    res
      .status(400)
      .json({ error: "メールアドレスとパスワードを入力してください。" });
    return;
  }
  if (password.trim().length < 8) {
    res
      .status(400)
      .json({ error: "パスワードは8文字以上で入力してください。" });
    return;
  }

  try {
    const existingUsers = await query<User[]>(
      "SELECT * FROM users WHERE email = $1;",
      [email]
    );
    if (existingUsers.length > 0) {
      res
        .status(409)
        .json({ error: "そのメースアドレスはすでに登録済みです。" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await exec("INSERT INTO users (email, password) VALUES ($1, $2);", [
      email,
      hashed,
    ]);
    res.status(201).json({ message: "会員登録に成功しました。" });
  } catch (e) {
    res.status(500).json({ error: "データベースエラーが発生しました。" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email.trim() || !password.trim()) {
    res
      .status(400)
      .json({ error: "メールアドレスとパスワードを入力してください。" });
    return;
  }

  try {
    const rows = await query<User[]>("SELECT * FROM users WHERE email = $1;", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: "ユーザーが存在しません。" });
      return;
    }
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      res.status(401).json({ error: "パスワードが間違っています。" });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ error: "ログインに成功しました。" });
  } catch (e) {
    res.status(500).json({ error: "データベースエラーが発生しました。" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("authToken");
  res.json({ message: "ログアウトしました。" });
});

router.get("/check", verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ message: "ログイン済みです。" });
});

export default router;

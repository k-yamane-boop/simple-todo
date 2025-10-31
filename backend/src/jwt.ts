import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

function getSecretKey(): string {
  const key = process.env.JWT_SECRET_KEY;
  if (!key) {
    throw new Error("環境変数JWT_SECRET_KEYが設定されていません。");
  }
  return key;
}

const SECRCT_KEY = getSecretKey();
const EXPIRES_IN = "1h";

export function generateToken(payload: object) {
  return jwt.sign(payload, SECRCT_KEY, { expiresIn: EXPIRES_IN });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ error: "認証トークンがありません。" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRCT_KEY);
    (req as any).user = decoded;
    next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.status(440).json({ error: "認証トークンが有効期限切れです。" });
      return;
    }
    res.status(401).json({ error: "認証トークンが無効です。" });
  }
}

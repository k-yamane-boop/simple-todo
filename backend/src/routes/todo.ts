import { Router } from "express";
import { exec, query } from "../db"; // ← pg版db.tsを使用
import type { Request, Response } from "express";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const router = Router();

function handleServerError(
  res: Response,
  err: unknown,
  message: string = "サーバーエラー"
) {
  console.error(err);
  res.status(500).json({ error: message });
}

// ✅ Todo一覧取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await query<Todo>(
      `SELECT id, title, completed, created_at AS "createdAt"
       FROM todos
       WHERE user_id = $1
       ORDER BY created_at DESC;`,
      [(req as any).user.id]
    );
    return res.status(200).json(rows);
  } catch (e) {
    handleServerError(res, e);
  }
});

// ✅ Todo作成
router.post("/", async (req: Request, res: Response) => {
  const { title }: { title: string } = req.body;
  if (!title.trim()) {
    res.status(400).json({ error: "Todoを入力してください。" });
    return;
  }
  if (title.trim().length > 50) {
    res.status(400).json({ error: "50文字以内で入力してください。" });
    return;
  }
  try {
    await exec(
      `INSERT INTO todos (title, completed, created_at, user_id)
       VALUES ($1, $2, $3, $4);`,
      [title, false, new Date(), (req as any).user.id]
    );
    res.status(201).json({ message: "Todoを追加しました。" });
  } catch (e) {
    handleServerError(res, e, "Todoの作成に失敗しました。");
  }
});

// ✅ Todo更新
router.put("/:id", async (req: Request, res: Response) => {
  const { title, completed } = req.body;
  if (!title.trim()) {
    res.status(400).json({ error: "Todoを入力してください。" });
    return;
  }
  if (title.trim().length > 50) {
    res.status(400).json({ error: "50文字以内で入力してください。" });
    return;
  }
  try {
    const result = await exec(
      `UPDATE todos
       SET title = $1, completed = $2
       WHERE id = $3 AND user_id = $4;`,
      [title, completed, req.params.id, (req as any).user.id]
    );

    // ✅ PostgreSQLでは rowCount で影響行数を確認
    if (result.rowCount === 0) {
      res.status(404).json({ error: "指定されたTodoが見つかりません。" });
      return;
    }

    res.status(200).json({ message: "Todoを更新しました。" });
  } catch (e) {
    handleServerError(res, e, "Todoの更新に失敗しました。");
  }
});

// ✅ Todo削除
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await exec(
      `DELETE FROM todos
       WHERE id = $1 AND user_id = $2;`,
      [req.params.id, (req as any).user.id]
    );

    // ✅ rowCount で削除件数を確認
    if (result.rowCount === 0) {
      res.status(404).json({ error: "指定されたTodoが見つかりません。" });
      return;
    }

    res.status(200).json({ message: "Todoを削除しました。" });
  } catch (e) {
    handleServerError(res, e, "Todoの削除に失敗しました。");
  }
});

export default router;

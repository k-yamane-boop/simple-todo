import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "",
};

const pool = new Pool(dbConfig);

// ✅ 接続終了
export async function closePool() {
  try {
    await pool.end();
    console.log("データベース接続プールを破棄しました。");
  } catch (e) {
    console.error("データベース接続プールの破棄中にエラーが発生しました：", e);
  }
}

// ✅ SELECTクエリ
export async function query<T = any>(sql: string, params: any[] = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows as T;
  } catch (e) {
    console.error("SQL実行中にエラーが発生しました。", e);
    throw e;
  }
}

// ✅ INSERT, UPDATE, DELETEクエリ
export async function exec(sql: string, params: any[] = []) {
  try {
    const result = await pool.query(sql, params);
    return result; // result.rowCountなどで変更件数を確認可能
  } catch (e) {
    console.error("SQL実行中にエラーが発生しました。", e);
    throw e;
  }
}

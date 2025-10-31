import mysql from "mysql2/promise";
import dotenv from "dotenv";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "",
};

const pool = mysql.createPool(dbConfig);

export async function closePool() {
  try {
    await pool.end();
    console.log("データベース接続プールを破棄しました。");
  } catch (e) {
    console.error("データベース接続プールの破棄中にエラーが発生しました：", e);
  }
}

// SELECT
export async function query<T = any>(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows as T;
  } catch (e) {
    console.error("SQL実行中にエラーが発生しました。", e);
    throw e;
  }
}

// INSERT, UPDATE, DELETE
export async function exec(sql: string, params: any[] = []) {
  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (e) {
    console.error("SQL実行中にエラーが発生しました。", e);
    throw e;
  }
}

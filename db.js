import sqlite3 from "sqlite3";
import { open } from "sqlite";

sqlite3.verbose();

async function initDB() {
  try {
    const db = await open({
      filename: "./posts.db",
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        imageUrl TEXT,
        createdAt TEXT,
        views INTEGER DEFAULT 0
      )
    `);

    console.log("Database connected and table created if it doesn't exist");
    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export default initDB;

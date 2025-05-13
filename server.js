import express from "express";
import cors from "cors";
import initDB from "./db.js";

const app = express();
const PORT = 3000;
const API_KEY = "go2future2049";

app.use(cors({ origin: "ffozilbek-blog.vercel.app" }));
app.use(express.json());

let db;
initDB().then((database) => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

// GET barcha postlar
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await db.all("SELECT * FROM posts ORDER BY createdAt DESC");
    res.json(posts);
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});

// GET bitta post ID orqali
app.get("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", [id]);

    if (!post) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    res.json(post);
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});

// POST yangi post qo‘shish
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, imageUrl, apiKey } = req.body;

    // Kalitni tekshirish
    if (apiKey !== API_KEY) {
      return res.status(403).json({ error: "Ruxsat etilmagan" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title va content kerak" });
    }

    // Hozirgi vaqtni olish va ISO formatda yaratish
    const createdAt = new Date().toISOString();

    const result = await db.run(
      "INSERT INTO posts (title, content, imageUrl, createdAt) VALUES (?, ?, ?, ?)",
      [title, content, imageUrl, createdAt]
    );

    res.status(201).json({ id: result.lastID, title, content, imageUrl, createdAt });
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});

// PUT: view sonini oshirish
app.put("/api/posts/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("UPDATE posts SET views = views + 1 WHERE id = ?", [id]);
    res.status(200).json({ message: "View soni oshirildi" });
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});

// DELETE: postni o'chirish
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Postni topib, o'chirish
    const result = await db.run("DELETE FROM posts WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    res.status(200).json({ message: "Post o'chirildi" });
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl, apiKey } = req.body;

    // API kalitni tekshirish
    if (apiKey !== API_KEY) {
      return res.status(403).json({ error: "Ruxsat etilmagan" });
    }

    // Majburiy maydonlar
    if (!title || !content) {
      return res.status(400).json({ error: "Title va content kerak" });
    }

    // Yangilash
    const result = await db.run(
      `UPDATE posts SET title = ?, content = ?, imageUrl = ? WHERE id = ?`,
      [title, content, imageUrl || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    res.status(200).json({ message: "Post yangilandi" });
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
});
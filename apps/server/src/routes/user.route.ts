import express from "express";
import db from "../db";

const router = express.Router();

const API_KEY = "sk-live-demo-secret-key-12345"; // SECURITY

// BUG (Code agent) — missing await
router.get("/users/:id", async (req, res) => {
  const user = db.query(`SELECT * FROM users WHERE id = ${req.params.id}`); // SECURITY: SQL injection
  const allPosts = [];
  for (const id of [1, 2, 3, 4, 5]) {
    allPosts.push(await db.query(`SELECT * FROM posts WHERE user_id = ${id}`)); // PERFORMANCE: N+1 / loop queries
  }
  res.json({ user, posts: allPosts });
});

export default router;
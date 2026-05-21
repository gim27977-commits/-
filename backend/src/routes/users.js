const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authMiddleware, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const users = db.prepare(
    'SELECT id, username, avatar, bio FROM users WHERE username LIKE ? LIMIT 20'
  ).all(`%${q}%`);
  res.json(users);
});

router.get('/:username', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, bio, avatar, created_at FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });

  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const followerCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?').get(user.id).cnt;
  const followingCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?').get(user.id).cnt;
  const isFollowing = !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.userId, user.id);

  res.json({ ...user, posts, followerCount, followingCount, isFollowing });
});

router.post('/:username/follow', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
  if (target.id === req.userId) return res.status(400).json({ error: '자기 자신을 팔로우할 수 없습니다' });

  const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.userId, target.id);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.userId, target.id);
    return res.json({ following: false });
  }
  db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.userId, target.id);
  res.json({ following: true });
});

module.exports = router;

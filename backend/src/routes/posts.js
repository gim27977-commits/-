const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { uploadImage } = require('../services/upload');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다'));
  },
});

function enrichPost(post, userId) {
  const likeCount = db.prepare('SELECT COUNT(*) as cnt FROM likes WHERE post_id = ?').get(post.id).cnt;
  const liked = userId ? !!db.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').get(post.id, userId) : false;
  const commentCount = db.prepare('SELECT COUNT(*) as cnt FROM comments WHERE post_id = ?').get(post.id).cnt;
  const author = db.prepare('SELECT id, username, avatar FROM users WHERE id = ?').get(post.user_id);
  return { ...post, likeCount, liked, commentCount, author };
}

router.get('/feed', authMiddleware, (req, res) => {
  const posts = db.prepare(`
    SELECT p.* FROM posts p
    WHERE p.user_id = ? OR p.user_id IN (
      SELECT following_id FROM follows WHERE follower_id = ?
    )
    ORDER BY p.created_at DESC
    LIMIT 30
  `).all(req.userId, req.userId);
  res.json(posts.map(p => enrichPost(p, req.userId)));
});

router.get('/explore', authMiddleware, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT 50').all();
  res.json(posts.map(p => enrichPost(p, req.userId)));
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '이미지를 업로드해주세요' });
  const { caption } = req.body;
  const id = uuidv4();
  try {
    const imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    db.prepare('INSERT INTO posts (id, user_id, image_url, caption) VALUES (?, ?, ?, ?)').run(id, req.userId, imageUrl, caption || '');
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    res.status(201).json(enrichPost(post, req.userId));
  } catch (err) {
    res.status(500).json({ error: '이미지 업로드 실패' });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다' });
  res.json(enrichPost(post, req.userId));
});

router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: '권한이 없습니다' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/like', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(req.params.id, req.userId);
    return res.json({ liked: false });
  }
  db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(req.params.id, req.userId);
  res.json({ liked: true });
});

router.get('/:id/comments', authMiddleware, (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

router.post('/:id/comments', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: '댓글 내용을 입력해주세요' });
  const id = uuidv4();
  db.prepare('INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)').run(id, req.params.id, req.userId, content.trim());
  const comment = db.prepare(`
    SELECT c.*, u.username, u.avatar FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id);
  res.status(201).json(comment);
});

module.exports = router;

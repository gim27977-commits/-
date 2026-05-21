import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { resolveMediaUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import Avatar from './Avatar';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastTap = useRef(0);

  const setLikeState = (newLiked) => {
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
  };

  const toggleLike = async () => {
    const { data } = await api.post(`/posts/${post.id}/like`);
    setLiked(data.liked);
    setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
  };

  const handleDoubleTap = async () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
      if (!liked) await toggleLike();
    }
    lastTap.current = now;
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    const { data } = await api.get(`/posts/${post.id}/comments`);
    setComments(data);
    setShowComments(true);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/posts/${post.id}/comments`, { content: comment });
    setComments(prev => [...prev, data]);
    setComment('');
    if (!showComments) setShowComments(true);
  };

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  return (
    <article className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden shadow-sm">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2.5">
          <Avatar username={post.author?.username} avatar={post.author?.avatar} size={36} ring />
          <span className="font-semibold text-sm">{post.author?.username}</span>
        </Link>
        {user?.id === post.user_id && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 hover:bg-gray-100 rounded-full">
              <FiMoreHorizontal />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => { setMenuOpen(false); onDelete && onDelete(post.id); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-semibold"
                  >삭제</button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <div className="relative bg-black" onClick={handleDoubleTap}>
        <img src={resolveMediaUrl(post.image_url)} alt="" className="w-full object-contain max-h-[600px] mx-auto select-none" draggable={false} />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AiFillHeart className="text-white text-9xl drop-shadow-2xl heart-pop" />
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className="transition-transform active:scale-90">
              {liked
                ? <AiFillHeart className="text-2xl text-red-500" />
                : <FiHeart className="text-2xl hover:text-gray-500" />}
            </button>
            <button onClick={loadComments} className="hover:text-gray-500">
              <FiMessageCircle className="text-2xl" />
            </button>
            <button className="hover:text-gray-500">
              <FiSend className="text-2xl" />
            </button>
          </div>
          <button className="hover:text-gray-500">
            <FiBookmark className="text-2xl" />
          </button>
        </div>

        <p className="font-semibold text-sm mb-1">좋아요 {likeCount.toLocaleString()}개</p>

        {post.caption && (
          <p className="text-sm">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold mr-1.5">{post.author?.username}</Link>
            {post.caption}
          </p>
        )}

        {post.commentCount > 0 && !showComments && (
          <button onClick={loadComments} className="text-sm text-gray-400 mt-1 hover:text-gray-500">
            댓글 {post.commentCount}개 모두 보기
          </button>
        )}

        {showComments && (
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
            {comments.map(c => (
              <p key={c.id} className="text-sm leading-snug">
                <Link to={`/profile/${c.username}`} className="font-semibold mr-1.5">{c.username}</Link>
                {c.content}
              </p>
            ))}
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-wide">{timeAgo(post.created_at)}</p>
      </div>

      <form onSubmit={submitComment} className="flex items-center border-t border-gray-100 px-4 py-2.5 gap-2">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="댓글 달기..."
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
        />
        <button type="submit" disabled={!comment.trim()} className="text-sm font-semibold text-blue-500 disabled:text-blue-200 hover:text-blue-700">게시</button>
      </form>
    </article>
  );
}

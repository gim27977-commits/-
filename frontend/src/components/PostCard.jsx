import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleLike = async () => {
    const { data } = await api.post(`/posts/${post.id}/like`);
    setLiked(data.liked);
    setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    const { data } = await api.get(`/posts/${post.id}/comments`);
    setComments(data);
    setShowComments(true);
    setLoadingComments(false);
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
    return `${Math.floor(diff / 86400)}일 전`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2">
          {post.author?.avatar
            ? <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{post.author?.username?.[0]?.toUpperCase()}</div>
          }
          <span className="font-semibold text-sm">{post.author?.username}</span>
        </Link>
        {user?.id === post.user_id && (
          <button onClick={() => onDelete && onDelete(post.id)} className="text-gray-400 hover:text-red-500 text-sm">삭제</button>
        )}
      </div>

      <Link to={`/post/${post.id}`}>
        <img src={post.image_url} alt="" className="w-full object-cover max-h-[600px]" />
      </Link>

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={toggleLike} className="text-2xl transition-transform active:scale-125">
            {liked ? '❤️' : '🤍'}
          </button>
          <button onClick={loadComments} className="text-2xl">💬</button>
        </div>

        <p className="font-semibold text-sm mb-1">좋아요 {likeCount}개</p>

        {post.caption && (
          <p className="text-sm">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold mr-1">{post.author?.username}</Link>
            {post.caption}
          </p>
        )}

        {post.commentCount > 0 && !showComments && (
          <button onClick={loadComments} className="text-sm text-gray-400 mt-1">
            댓글 {post.commentCount}개 보기
          </button>
        )}

        {loadingComments && <p className="text-sm text-gray-400 mt-1">로딩 중...</p>}

        {showComments && (
          <div className="mt-2 space-y-1">
            {comments.map(c => (
              <p key={c.id} className="text-sm">
                <span className="font-semibold mr-1">{c.username}</span>{c.content}
              </p>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">{timeAgo(post.created_at)}</p>
      </div>

      <form onSubmit={submitComment} className="flex items-center border-t border-gray-100 px-4 py-2 gap-2">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="댓글 달기..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
        <button type="submit" disabled={!comment.trim()} className="text-sm font-semibold text-blue-500 disabled:text-blue-200">게시</button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    if (confirmText !== user.username) return;
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch {
      alert('삭제 실패. 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold">설정</h1>
        </div>

        <nav className="divide-y divide-gray-100">
          <Link to={`/profile/${user?.username}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <span className="text-sm">프로필 편집</span>
            <span className="text-gray-400">›</span>
          </Link>
          <Link to="/privacy" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <span className="text-sm">개인정보 처리방침</span>
            <span className="text-gray-400">›</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 text-left">
            <span className="text-sm">로그아웃</span>
            <span className="text-gray-400">›</span>
          </button>
        </nav>

        <div className="border-t border-gray-200 p-6 bg-red-50/30">
          <h2 className="font-semibold text-red-600 text-sm mb-2">위험 구역</h2>
          <p className="text-xs text-gray-600 mb-4">
            계정을 삭제하면 모든 게시물, 댓글, 팔로우 관계가 영구적으로 사라지며 복구할 수 없습니다.
          </p>

          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="text-red-600 text-sm font-semibold hover:text-red-700">
              계정 삭제
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-700">
                삭제를 확인하려면 사용자 이름 <strong>{user?.username}</strong>을(를) 입력하세요:
              </p>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                placeholder={user?.username}
              />
              <div className="flex gap-2">
                <button
                  onClick={deleteAccount}
                  disabled={confirmText !== user?.username || deleting}
                  className="bg-red-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >{deleting ? '삭제 중...' : '영구 삭제'}</button>
                <button
                  onClick={() => { setConfirming(false); setConfirmText(''); }}
                  className="border border-gray-300 px-4 py-1.5 rounded text-sm"
                >취소</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

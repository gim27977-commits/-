import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || '로그인 실패'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-3">
          <div className="text-center mb-8"><Logo className="text-5xl" /></div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={submit} className="space-y-2">
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none focus:border-gray-400" placeholder="이메일" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none focus:border-gray-400" placeholder="비밀번호" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white rounded py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 mt-2">{loading ? '로그인 중...' : '로그인'}</button>
          </form>
          <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">OR</span><div className="flex-1 h-px bg-gray-200"/></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-center">
          계정이 없으신가요? <Link to="/register" className="text-blue-500 font-semibold">가입하기</Link>
        </div>
      </div>
    </div>
  );
}

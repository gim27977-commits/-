import { resolveMediaUrl } from '../api';

export default function Avatar({ username, avatar, size = 32, ring = false, className = '' }) {
  const initial = username?.[0]?.toUpperCase() || '?';
  const sizeStyle = { width: size, height: size };
  const fontSize = Math.max(10, Math.floor(size / 2.5));

  const inner = avatar ? (
    <img src={resolveMediaUrl(avatar)} alt={username} className="w-full h-full rounded-full object-cover" />
  ) : (
    <div
      className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold"
      style={{ fontSize }}
    >
      {initial}
    </div>
  );

  if (ring) {
    return (
      <div className="gradient-ring inline-block" style={sizeStyle}>
        <div className="gradient-ring-inner w-full h-full">{inner}</div>
      </div>
    );
  }
  return <div className={`inline-block ${className}`} style={sizeStyle}>{inner}</div>;
}

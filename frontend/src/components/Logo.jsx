export default function Logo({ className = '' }) {
  return (
    <span className={`font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent ${className}`}
      style={{ fontFamily: '"Pacifico", "Brush Script MT", cursive' }}>
      Momento
    </span>
  );
}

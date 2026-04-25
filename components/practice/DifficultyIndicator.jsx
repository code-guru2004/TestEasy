// components/practice/DifficultyIndicator.jsx
export default function DifficultyIndicator({ difficulty }) {
    const config = {
      easy: { color: 'text-green-400', bg: 'bg-green-400/20', label: 'Easy' },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Medium' },
      hard: { color: 'text-red-400', bg: 'bg-red-400/20', label: 'Hard' }
    };
    
    const { color, bg, label } = config[difficulty];
    
    return (
      <div className={`px-3 py-1 rounded-full ${bg} ${color} text-sm font-semibold`}>
        {label}
      </div>
    );
  }
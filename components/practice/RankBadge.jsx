// components/practice/RankBadge.jsx
export default function RankBadge({ rank, size = 'md' }) {
    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-3 py-1',
      lg: 'text-base px-4 py-1.5'
    };
    
    const colors = {
      Beginner: 'bg-gray-600 text-gray-100',
      Intermediate: 'bg-blue-600 text-blue-100',
      Advanced: 'bg-purple-600 text-purple-100',
      Pro: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-yellow-100'
    };
    
    return (
      <div className={`rounded-full font-bold ${sizes[size]} ${colors[rank]} shadow-lg`}>
        {rank}
      </div>
    );
  }
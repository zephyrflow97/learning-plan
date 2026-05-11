// FilterButtons.jsx - 筛选按钮组件
function FilterButtons({ current, onChange }) {
  const filters = [
    { id: 'all', label: '全部' },
    { id: 'active', label: '进行中' },
    { id: 'completed', label: '已完成' }
  ];
  
  return (
    <div className="filter-buttons">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={`filter-btn ${current === filter.id ? 'active' : ''}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;

// Stats.jsx - 统计组件
function Stats({ stats }) {
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  
  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-label">总计:</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">进行中:</span>
        <span className="stat-value">{stats.active}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">已完成:</span>
        <span className="stat-value">{stats.completed}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">完成率:</span>
        <span className="stat-value">{completionRate}%</span>
      </div>
    </div>
  );
}

export default Stats;

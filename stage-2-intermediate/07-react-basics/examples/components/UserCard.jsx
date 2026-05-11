// UserCard.jsx - 实战组件：用户卡片
function UserCard({ user, onEdit, onDelete }) {
  console.log('[UserCard] 渲染用户卡片:', user.name);
  
  // 计算派生数据
  const initials = user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  console.log('[UserCard] 用户名首字母:', initials);
  
  return (
    <div className="user-card">
      {/* 头像 */}
      <div className="avatar">{initials}</div>
      
      {/* 用户信息 */}
      <div className="info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>加入于: {new Date(user.joinedAt).toLocaleDateString()}</p>
      </div>
      
      {/* 操作按钮 */}
      <div className="actions">
        <button onClick={() => {
          console.log('[UserCard] 编辑用户:', user.id);
          onEdit(user.id);
        }}>
          编辑
        </button>
        
        <button onClick={() => {
          console.log('[UserCard] 删除用户:', user.id);
          onDelete(user.id);
        }}>
          删除
        </button>
      </div>
    </div>
  );
}

// 使用示例
function App() {
  const users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joinedAt: '2023-01-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', joinedAt: '2023-02-20' }
  ];
  
  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={(id) => console.log(`编辑用户 ${id}`)}
          onDelete={(id) => console.log(`删除用户 ${id}`)}
        />
      ))}
    </div>
  );
}

export default UserCard;

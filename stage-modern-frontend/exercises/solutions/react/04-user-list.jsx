import { useState } from 'react';

const users = [
  { id: 1, name: '张三', email: 'zhang@example.com' },
  { id: 2, name: '李四', email: 'li@example.com' },
  { id: 3, name: '王五', email: 'wang@example.com' },
];

function UserList() {
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤逻辑
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(`[过滤] 搜索词: "${searchTerm}", 结果数: ${filteredUsers.length}`);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>👥 用户列表</h1>

      {/* 搜索框 */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜索用户名..."
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          marginBottom: '20px',
        }}
      />

      {/* 结果数量 */}
      <p style={{ color: '#666' }}>
        共 {filteredUsers.length} 个结果
      </p>

      {/* 用户列表 */}
      {filteredUsers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>无结果</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredUsers.map(user => (
            <li
              key={user.id}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>{user.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;

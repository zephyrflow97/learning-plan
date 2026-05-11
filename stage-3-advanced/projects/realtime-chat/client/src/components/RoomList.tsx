/**
 * 聊天室列表组件
 */

import './RoomList.css'

interface Room {
  id: string
  name: string
  description?: string
  memberCount: number
  isJoined?: boolean
}

interface RoomListProps {
  rooms: Room[]
  currentRoomId: string | null
  onSelectRoom: (roomId: string) => void
  onJoinRoom: (roomId: string) => void
}

export default function RoomList({
  rooms,
  currentRoomId,
  onSelectRoom,
  onJoinRoom,
}: RoomListProps) {
  const handleRoomClick = (room: Room) => {
    if (room.isJoined) {
      onSelectRoom(room.id)
    } else {
      onJoinRoom(room.id)
    }
  }

  if (rooms.length === 0) {
    return <div className="empty-rooms">暂无聊天室</div>
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`room-item ${currentRoomId === room.id ? 'active' : ''} ${
            !room.isJoined ? 'not-joined' : ''
          }`}
          onClick={() => handleRoomClick(room)}
        >
          <div className="room-icon">
            <span>#</span>
          </div>
          <div className="room-info">
            <div className="room-name">{room.name}</div>
            {room.description && (
              <div className="room-description">{room.description}</div>
            )}
            <div className="room-meta">
              {room.memberCount} 成员
              {!room.isJoined && <span className="join-badge">点击加入</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

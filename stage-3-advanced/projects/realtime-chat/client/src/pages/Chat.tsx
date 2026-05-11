/**
 * 聊天主页面
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { roomAPI } from '../services/api'
import socketService from '../services/socket'
import RoomList from '../components/RoomList'
import ChatWindow from '../components/ChatWindow'
import './Chat.css'

export default function Chat() {
  const [rooms, setRooms] = useState<any[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  // 加载聊天室列表
  useEffect(() => {
    loadRooms()
  }, [])

  // 连接 WebSocket
  useEffect(() => {
    const socket = socketService.connect()

    // 监听错误
    socketService.onError((data) => {
      console.error('Socket 错误:', data)
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const myRooms = await roomAPI.getMyRooms()
      const allRooms = await roomAPI.getAllRooms()

      // 合并并去重
      const roomMap = new Map()
      myRooms.forEach((room: any) => {
        roomMap.set(room.id, { ...room, isJoined: true })
      })
      allRooms.forEach((room: any) => {
        if (!roomMap.has(room.id)) {
          roomMap.set(room.id, { ...room, isJoined: false })
        }
      })

      setRooms(Array.from(roomMap.values()))
    } catch (error) {
      console.error('加载聊天室失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const handleCreateRoom = async () => {
    const name = prompt('请输入聊天室名称:')
    if (!name) return

    try {
      await roomAPI.createRoom(name)
      await loadRooms()
    } catch (error: any) {
      alert(error.response?.data?.error || '创建聊天室失败')
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    try {
      await roomAPI.joinRoom(roomId)
      setCurrentRoomId(roomId)
      await loadRooms()
    } catch (error: any) {
      alert(error.response?.data?.error || '加入聊天室失败')
    }
  }

  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId)
  }

  return (
    <div className="chat-container">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">{user?.username[0].toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            退出
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="section-header">
              <h3>聊天室</h3>
              <button className="btn-icon" onClick={handleCreateRoom} title="创建聊天室">
                +
              </button>
            </div>

            {loading ? (
              <div className="loading">加载中...</div>
            ) : (
              <RoomList
                rooms={rooms}
                currentRoomId={currentRoomId}
                onSelectRoom={handleSelectRoom}
                onJoinRoom={handleJoinRoom}
              />
            )}
          </div>
        </div>
      </aside>

      {/* 聊天窗口 */}
      <main className="main-content">
        {currentRoomId ? (
          <ChatWindow
            roomId={currentRoomId}
            room={rooms.find((r) => r.id === currentRoomId)}
          />
        ) : (
          <div className="empty-state">
            <h2>欢迎使用实时聊天</h2>
            <p>选择一个聊天室开始对话</p>
          </div>
        )}
      </main>
    </div>
  )
}

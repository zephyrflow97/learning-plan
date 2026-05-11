/**
 * 聊天窗口组件
 */

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useAuthStore } from '../stores/authStore'
import socketService from '../services/socket'
import './ChatWindow.css'

interface Message {
  id: string
  userId: string
  username: string
  content: string
  createdAt: string
}

interface ChatWindowProps {
  roomId: string
  room: any
}

export default function ChatWindow({ roomId, room }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const user = useAuthStore((state) => state.user)

  // 加入房间并加载历史消息
  useEffect(() => {
    if (!roomId) return

    setMessages([])
    socketService.joinRoom(roomId)

    // 监听历史消息
    const handleHistory = (data: any) => {
      if (data.roomId === roomId) {
        setMessages(data.messages)
      }
    }

    // 监听新消息
    const handleNewMessage = (message: any) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message])
      }
    }

    // 监听输入状态
    const handleTyping = (data: any) => {
      if (data.roomId === roomId) {
        setTypingUsers(data.userIds.filter((id: string) => id !== user?.id))
      }
    }

    socketService.onRoomHistory(handleHistory)
    socketService.onNewMessage(handleNewMessage)
    socketService.onTyping(handleTyping)

    return () => {
      socketService.leaveRoom(roomId)
      socketService.removeAllListeners()
    }
  }, [roomId, user?.id])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    socketService.sendMessage(roomId, inputValue.trim())
    setInputValue('')
    socketService.sendTyping(roomId, false)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // 发送输入状态
    if (value.trim()) {
      socketService.sendTyping(roomId, true)

      // 3 秒后自动取消输入状态
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(roomId, false)
      }, 3000)
    } else {
      socketService.sendTyping(roomId, false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="chat-window">
      {/* 聊天室头部 */}
      <div className="chat-header">
        <div className="chat-room-info">
          <div className="chat-room-icon">#</div>
          <div>
            <div className="chat-room-name">{room?.name}</div>
            <div className="chat-room-meta">{room?.memberCount} 成员</div>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => {
            const isOwn = message.userId === user?.id

            return (
              <div
                key={message.id}
                className={`message ${isOwn ? 'own' : 'other'}`}
              >
                {!isOwn && (
                  <div className="message-avatar">
                    {message.username[0].toUpperCase()}
                  </div>
                )}
                <div className="message-content">
                  {!isOwn && (
                    <div className="message-author">{message.username}</div>
                  )}
                  <div className="message-bubble">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span>正在输入...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入框 */}
      <form className="message-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="message-input"
          placeholder="输入消息..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={!inputValue.trim()}
        >
          发送
        </button>
      </form>
    </div>
  )
}

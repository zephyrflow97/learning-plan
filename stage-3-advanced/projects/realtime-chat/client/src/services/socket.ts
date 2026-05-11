/**
 * WebSocket 服务
 * 
 * 封装 Socket.IO 客户端连接和事件处理
 */

import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3100'

class SocketService {
  private socket: Socket | null = null

  /**
   * 连接到 WebSocket 服务器
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = useAuthStore.getState().token

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket 连接成功')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket 断开连接:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error)
    })

    return this.socket
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 获取 socket 实例
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * 加入聊天室
   */
  joinRoom(roomId: string): void {
    this.socket?.emit('room:join', { roomId })
  }

  /**
   * 离开聊天室
   */
  leaveRoom(roomId: string): void {
    this.socket?.emit('room:leave', { roomId })
  }

  /**
   * 发送消息
   */
  sendMessage(roomId: string, content: string): void {
    this.socket?.emit('message:send', { roomId, content })
  }

  /**
   * 发送输入状态
   */
  sendTyping(roomId: string, isTyping: boolean): void {
    this.socket?.emit('message:typing', { roomId, isTyping })
  }

  /**
   * 监听新消息
   */
  onNewMessage(callback: (data: any) => void): void {
    this.socket?.on('message:new', callback)
  }

  /**
   * 监听房间历史消息
   */
  onRoomHistory(callback: (data: any) => void): void {
    this.socket?.on('room:history', callback)
  }

  /**
   * 监听用户加入房间
   */
  onUserJoined(callback: (data: any) => void): void {
    this.socket?.on('room:user_joined', callback)
  }

  /**
   * 监听用户离开房间
   */
  onUserLeft(callback: (data: any) => void): void {
    this.socket?.on('room:user_left', callback)
  }

  /**
   * 监听用户在线状态
   */
  onUserOnline(callback: (data: any) => void): void {
    this.socket?.on('user:online', callback)
  }

  /**
   * 监听用户离线状态
   */
  onUserOffline(callback: (data: any) => void): void {
    this.socket?.on('user:offline', callback)
  }

  /**
   * 监听输入状态
   */
  onTyping(callback: (data: any) => void): void {
    this.socket?.on('message:typing', callback)
  }

  /**
   * 监听错误
   */
  onError(callback: (data: any) => void): void {
    this.socket?.on('error', callback)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.socket?.removeAllListeners()
  }
}

export const socketService = new SocketService()
export default socketService

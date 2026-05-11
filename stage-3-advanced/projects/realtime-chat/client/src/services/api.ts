/**
 * API 服务
 * 
 * 封装所有 HTTP API 调用
 */

import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 令牌无效，清除认证状态
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  }
)

// 认证 API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post('/api/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
}

// 聊天室 API
export const roomAPI = {
  getAllRooms: async () => {
    const response = await apiClient.get('/api/rooms')
    return response.data.rooms
  },

  getMyRooms: async () => {
    const response = await apiClient.get('/api/rooms/my')
    return response.data.rooms
  },

  createRoom: async (name: string, description?: string, isPrivate = false) => {
    const response = await apiClient.post('/api/rooms', {
      name,
      description,
      isPrivate,
    })
    return response.data.room
  },

  joinRoom: async (roomId: string) => {
    const response = await apiClient.post(`/api/rooms/${roomId}/join`)
    return response.data
  },

  leaveRoom: async (roomId: string) => {
    const response = await apiClient.post(`/api/rooms/${roomId}/leave`)
    return response.data
  },
}

export default apiClient

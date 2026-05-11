// ==========================================
// 全局错误边界（Error Boundary）
// ==========================================

import { Component, ReactNode } from 'react';
import { TRPCClientError } from '@trpc/client';

/**
 * Props 类型
 */
interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * State 类型
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 
 * 捕获子组件树中的所有 JavaScript 错误，
 * 包括 tRPC 错误，显示备用 UI。
 * 
 * 使用方式：
 * ```tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  /**
   * 从错误中更新 state
   * 
   * 这个静态方法在错误被抛出时调用
   */
  static getDerivedStateFromError(error: Error): State {
    console.log('[ErrorBoundary] getDerivedStateFromError:', error.message);
    
    return {
      hasError: true,
      error,
    };
  }
  
  /**
   * 错误被捕获后的回调
   * 
   * 用于记录错误日志、上报错误监控等
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] componentDidCatch');
    console.error('[ErrorBoundary] Error:', error);
    console.error('[ErrorBoundary] Component Stack:', errorInfo.componentStack);
    
    /**
     * ✅ 检查是否是 tRPC 错误
     */
    if (error instanceof TRPCClientError) {
      const trpcError = error;
      
      console.error('[ErrorBoundary] tRPC Error Code:', trpcError.data?.code);
      console.error('[ErrorBoundary] tRPC Error Message:', trpcError.message);
      console.error('[ErrorBoundary] HTTP Status:', trpcError.data?.httpStatus);
      
      /**
       * 根据错误码分别处理
       */
      switch (trpcError.data?.code) {
        case 'UNAUTHORIZED':
          console.log('[ErrorBoundary] 未认证错误，重定向到登录页');
          // window.location.href = '/login';
          break;
        
        case 'FORBIDDEN':
          console.log('[ErrorBoundary] 权限不足');
          break;
        
        case 'NOT_FOUND':
          console.log('[ErrorBoundary] 资源不存在');
          break;
        
        case 'INTERNAL_SERVER_ERROR':
          console.log('[ErrorBoundary] 服务器错误');
          break;
        
        default:
          console.log('[ErrorBoundary] 其他 tRPC 错误');
      }
      
      /**
       * ✅ 上报错误到监控系统
       * 
       * 使用 Sentry、LogRocket 等服务
       */
      // Sentry.captureException(error, {
      //   tags: {
      //     errorCode: trpcError.data?.code,
      //     httpStatus: trpcError.data?.httpStatus,
      //   },
      //   extra: {
      //     trpcError: trpcError.data,
      //   },
      // });
    } else {
      /**
       * 非 tRPC 错误（如 React 渲染错误）
       */
      console.error('[ErrorBoundary] React Error:', error);
      
      // Sentry.captureException(error, {
      //   tags: { errorType: 'react' },
      // });
    }
  }
  
  /**
   * 重置错误状态
   */
  resetError = () => {
    console.log('[ErrorBoundary] 重置错误状态');
    this.setState({ hasError: false, error: null });
  };
  
  /**
   * 渲染
   */
  render() {
    if (this.state.hasError && this.state.error) {
      /**
       * 如果提供了自定义 fallback，使用它
       */
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }
      
      /**
       * 默认错误 UI
       */
      return (
        <div className="error-boundary-fallback">
          <div className="error-container">
            <h1>😵 出错了</h1>
            
            {/* 错误消息 */}
            <p className="error-message">
              {this.state.error.message}
            </p>
            
            {/* tRPC 错误详情 */}
            {this.state.error instanceof TRPCClientError && (
              <div className="trpc-error-details">
                <p>
                  <strong>错误码:</strong>{' '}
                  {this.state.error.data?.code || 'UNKNOWN'}
                </p>
                <p>
                  <strong>HTTP 状态:</strong>{' '}
                  {this.state.error.data?.httpStatus || 'N/A'}
                </p>
              </div>
            )}
            
            {/* 错误堆栈（开发环境） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-stack">
                <summary>查看错误堆栈</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            
            {/* 操作按钮 */}
            <div className="error-actions">
              <button onClick={this.resetError} className="retry-button">
                🔄 重试
              </button>
              <button onClick={() => window.location.href = '/'} className="home-button">
                🏠 返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    /**
     * 没有错误，正常渲染子组件
     */
    return this.props.children;
  }
}

/**
 * 📚 使用示例
 * 
 * 基础用法：
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ErrorBoundary>
 *           <TRPCProvider>
 *             {children}
 *           </TRPCProvider>
 *         </ErrorBoundary>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * 自定义 fallback：
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>自定义错误页面</h1>
 *       <p>{error.message}</p>
 *       <button onClick={reset}>重试</button>
 *     </div>
 *   )}
 * >
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */

/**
 * 📚 嵌套错误边界
 * 
 * 你可以在应用的不同层级设置多个错误边界：
 * 
 * ```tsx
 * <ErrorBoundary fallback={GlobalErrorFallback}>
 *   <Header />
 *   
 *   <ErrorBoundary fallback={SidebarErrorFallback}>
 *     <Sidebar />
 *   </ErrorBoundary>
 *   
 *   <ErrorBoundary fallback={ContentErrorFallback}>
 *     <Content />
 *   </ErrorBoundary>
 * </ErrorBoundary>
 * ```
 * 
 * 好处：
 * - 侧边栏出错不会影响主内容
 * - 可以针对不同区域定制错误 UI
 */

/**
 * 📚 错误边界的限制
 * 
 * Error Boundary **无法**捕获：
 * - 事件处理器中的错误（使用 try-catch）
 * - 异步代码（setTimeout, Promise）
 * - 服务端渲染
 * - 错误边界自己的错误
 * 
 * 示例：
 * ```tsx
 * // ❌ Error Boundary 无法捕获
 * <button onClick={() => {
 *   throw new Error('Click error');
 * }}>
 *   Click
 * </button>
 * 
 * // ✅ 需要手动 try-catch
 * <button onClick={() => {
 *   try {
 *     throw new Error('Click error');
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }}>
 *   Click
 * </button>
 * ```
 */

/**
 * 📚 样式（仅供参考）
 * 
 * ```css
 * .error-boundary-fallback {
 *   min-height: 100vh;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   padding: 20px;
 *   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 * }
 * 
 * .error-container {
 *   max-width: 600px;
 *   background: white;
 *   padding: 40px;
 *   border-radius: 12px;
 *   box-shadow: 0 20px 60px rgba(0,0,0,0.3);
 * }
 * 
 * .error-message {
 *   color: #c00;
 *   font-size: 18px;
 *   margin: 20px 0;
 * }
 * 
 * .error-stack {
 *   margin: 20px 0;
 * }
 * 
 * .error-stack pre {
 *   background: #f5f5f5;
 *   padding: 10px;
 *   border-radius: 4px;
 *   overflow-x: auto;
 *   font-size: 12px;
 * }
 * 
 * .error-actions {
 *   display: flex;
 *   gap: 10px;
 *   margin-top: 20px;
 * }
 * 
 * .retry-button, .home-button {
 *   padding: 10px 20px;
 *   border: none;
 *   border-radius: 6px;
 *   cursor: pointer;
 *   font-size: 16px;
 * }
 * 
 * .retry-button {
 *   background: #667eea;
 *   color: white;
 * }
 * 
 * .home-button {
 *   background: #f0f0f0;
 * }
 * ```
 */

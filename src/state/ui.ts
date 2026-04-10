import { getNavigator, executePluginCommand } from '@momoyu-ink/kit';
import { proxy } from 'valtio';

// 页面类型定义
export type GamePage = 'title' | 'stage' | 'cg' | 'bgm' | 'credits';

// 浮层类型定义
export type OverlayType = 'settings' | 'save' | 'load' | 'menu' | 'backlog' | 'confirm';

// 浮层信息接口
export interface OverlayInfo {
  type: OverlayType;
  props?: Record<string, any>;
  id: string;
}

// 通知信息接口
export interface NotificationInfo {
  id: string;
  message: string;
  duration: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

// UI 状态接口
export interface UIState {
  notifications: NotificationInfo[];
}

// 创建 UI 状态
export const uiState = proxy<UIState>({
  notifications: [],
});

// 生成唯一ID的辅助函数
let notificationIdCounter = 0;
const generateNotificationId = (): string => {
  return `notification-${++notificationIdCounter}-${Date.now()}`;
};

// UI 操作函数（精简后的通知系统与截图）
export const uiActions = {
  takeSnapshot: async (width: number, height: number): Promise<void> => {
    try {
      await executePluginCommand('system', {
        subCommand: 'takeSnapshot',
        width,
        height,
      });
    } catch (error) {
      console.error('截图失败（已忽略）:', error);
    }
  },

  // 便捷方法：显示确认对话框
  confirm: (message: string, onConfirm?: () => void, onCancel?: () => void) => {
    getNavigator().pushOverlay('confirm', {
      message,
      onConfirm,
      onCancel,
    });
  },

  // 通知管理
  /**
   * 显示全局通知
   * @param message 通知消息
   * @param options 通知选项
   * @example context.notify('操作成功', { duration: 3000 })
   */
  notify: (
    message: string,
    options: {
      duration?: number;
      fadeInDuration?: number;
      fadeOutDuration?: number;
    } = {},
  ) => {
    const fadeInDuration = options.fadeInDuration ?? 300;
    const duration = options.duration ?? 2000;
    const fadeOutDuration = options.fadeOutDuration ?? 300;

    const notification: NotificationInfo = {
      id: generateNotificationId(),
      message,
      duration,
      fadeInDuration,
      fadeOutDuration,
    };
    uiState.notifications.push(notification);

    // Auto-remove from state after the set duration plus fade-in time
    // The component's useTransition will handle the leave animation
    setTimeout(() => {
      uiActions.removeNotification(notification.id);
    }, fadeInDuration + duration);
  },

  /**
   * 手动移除指定通知
   * @param id 通知ID
   */
  removeNotification: (id: string) => {
    const index = uiState.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      uiState.notifications.splice(index, 1);
    }
  },

  /**
   * 清除所有通知
   */
  clearNotifications: () => {
    uiState.notifications.length = 0;
  },
};

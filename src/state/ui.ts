import { proxy } from 'valtio';

// 页面类型定义
export type GamePage = 'title' | 'stage' | 'cg' | 'bgm' | 'credits';

// 浮层类型定义
export type OverlayType = 'settings' | 'save' | 'load' | 'menu' | 'history' | 'confirm';

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

// UI 路由状态接口
export interface UIState {
  currentPage: GamePage;
  isNewGame: boolean;
  overlayStack: OverlayInfo[];
  notifications: NotificationInfo[];
}

// 创建 UI 状态
export const uiState = proxy<UIState>({
  currentPage: 'title',
  isNewGame: true,
  overlayStack: [],
  notifications: [],
});

// 生成唯一ID的辅助函数
let overlayIdCounter = 0;
const generateOverlayId = (): string => {
  return `overlay-${++overlayIdCounter}-${Date.now()}`;
};

let notificationIdCounter = 0;
const generateNotificationId = (): string => {
  return `notification-${++notificationIdCounter}-${Date.now()}`;
};

// 路由操作函数
export const uiActions = {
  // 页面导航
  navigateToPage: (page: GamePage) => {
    uiState.currentPage = page;
  },

  // 浮层栈操作
  pushOverlay: (type: OverlayType, props?: Record<string, any>) => {
    const overlayInfo: OverlayInfo = {
      type,
      props,
      id: generateOverlayId(),
    };
    uiState.overlayStack.push(overlayInfo);
  },

  popOverlay: () => {
    if (uiState.overlayStack.length > 0) {
      uiState.overlayStack.pop();
    }
  },

  clearOverlays: () => {
    uiState.overlayStack.length = 0;
  },

  // 状态查询
  getCurrentPage: (): GamePage => {
    return uiState.currentPage;
  },

  getOverlayStack: (): OverlayInfo[] => {
    return uiState.overlayStack;
  },

  isOverlayActive: (type: OverlayType): boolean => {
    return uiState.overlayStack.some((overlay) => overlay.type === type);
  },

  // 向后兼容的方法
  setPage: (page: GamePage) => {
    uiActions.navigateToPage(page);
  },

  setOverlayPage: (overlayType: OverlayType | null) => {
    if (overlayType === null) {
      uiActions.popOverlay();
    } else {
      uiActions.pushOverlay(overlayType);
    }
  },

  // 设置新游戏状态
  setIsNewGame: (isNew: boolean) => {
    uiState.isNewGame = isNew;
  },

  // 便捷方法：显示确认对话框
  confirm: (message: string, onConfirm?: () => void, onCancel?: () => void) => {
    uiActions.pushOverlay('confirm', {
      message,
      onConfirm: (confirmed: boolean) => {
        uiActions.popOverlay(); // 关闭确认对话框
        if (confirmed && onConfirm) {
          onConfirm();
        } else if (!confirmed && onCancel) {
          onCancel();
        }
      },
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
    const notification: NotificationInfo = {
      id: generateNotificationId(),
      message,
      duration: options.duration ?? 2000,
      fadeInDuration: options.fadeInDuration ?? 300,
      fadeOutDuration: options.fadeOutDuration ?? 300,
    };
    uiState.notifications.push(notification);
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

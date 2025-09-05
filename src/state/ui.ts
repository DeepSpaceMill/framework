import { proxy } from 'valtio';

// 页面类型定义
export type GamePage = 'title' | 'stage' | 'cg' | 'bgm' | 'credits';

// 浮层类型定义
export type OverlayType = 'settings' | 'save' | 'load' | 'menu' | 'history' | 'dialog';

// 浮层信息接口
export interface OverlayInfo {
  type: OverlayType;
  props?: Record<string, any>;
  id: string;
}

// UI 路由状态接口
export interface UIState {
  currentPage: GamePage;
  overlayStack: OverlayInfo[];
}

// 创建 UI 状态
export const uiState = proxy<UIState>({
  currentPage: 'title',
  overlayStack: [],
});

// 生成唯一ID的辅助函数
let overlayIdCounter = 0;
const generateOverlayId = (): string => {
  return `overlay-${++overlayIdCounter}-${Date.now()}`;
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
    return uiState.overlayStack.some(overlay => overlay.type === type);
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
};

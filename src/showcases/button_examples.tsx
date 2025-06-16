import React from 'react';
import { Button } from '../components/button';
import { CustomButton } from './custom_button';
import { useButton } from '../hooks/useButton';
import { type MouseEvent, type TouchEvent } from '@momoyu-ink/kit';

/**
 * 按钮使用示例组件
 */
export function ButtonExamples() {
  // 使用新的 ButtonNew 组件（与原始 Button 兼容）
  const handleImageButtonClick = () => {
    console.log('Image button clicked!');
  };

  // 使用 CustomButton 组件（完全自定义样式）
  const handleCustomButtonClick = () => {
    console.log('Custom button clicked!');
  };
  // 直接使用 useButton hook 创建完全自定义的按钮
  const { buttonState, handlers } = useButton({
    onClick: () => console.log('Direct hook usage button clicked!'),
  });

  // 根据按钮状态获取样式
  const getButtonStyle = () => {
    switch (buttonState) {
      case 'hover':
        return { background: '#f39c12', transform: 'scale(1.05)' };
      case 'press':
        return { background: '#e67e22', transform: 'scale(0.95)' };
      default:
        return { background: '#f1c40f', transform: 'scale(1)' };
    }
  };

  return (
    <container>
      <text text="Button Examples" fontSize={24} fillColor="#333" y={-150} />
      {/* 原始图像按钮的替代方案 */}
      <Button
        fileName="btn_sys_01_config"
        label="Config Button"
        text="配置"
        fontSize={16}
        color="#ffffff"
        y={-80}
        onClick={handleImageButtonClick}
      />
      {/* 自定义样式按钮 */}
      <CustomButton
        idleColor="#2ecc71"
        hoverColor="#27ae60"
        pressColor="#1e8449"
        onClick={handleCustomButtonClick}
        y={0}
      >
        <text text="自定义按钮" fontSize={16} fillColor="#ffffff" />
      </CustomButton>
      {/* 直接使用 hook 的完全自定义实现 */}
      <container y={80} {...handlers}>
        <sprite
          src="new2/idle.png"
          tint={getButtonStyle().background}
          cursor="pointer"
          pivot={[0.5, 0.5]}
          x={50}
          scale={
            getButtonStyle().transform === 'scale(1)'
              ? 1
              : getButtonStyle().transform === 'scale(1.05)'
              ? 1.05
              : 0.95
          }
        />
        <text
          text="Hook 直接使用"
          fontSize={16}
          fillColor="#ffffff"
          interactive={false}
        />
      </container>
    </container>
  );
}

import { type HaiNodeAttributes, animated, useSpring, useTransition } from '@hai/lib';
import React, { useEffect } from 'react';
import { TEXT_COLOR } from '../constants';
import { Button } from './button';

export interface DialogProps extends HaiNodeAttributes {
  title: string;
  content: string;
  mode: 'alert' | 'confirm';
  show: boolean;
  onConfirm?: (yes?: boolean) => void;
}

export function Dialog(props: DialogProps) {
  const { title, content, mode, show, onConfirm } = props;

  console.log('dialog show', show);

  const transitions = useTransition(show ? [0] : [], {
    keys: (item) => item,
    from: {
      opacity: 0,
      scale: 0.3,
    },
    enter: {
      opacity: 1,
      scale: 1,
    },
    leave: {
      opacity: 0,
      scale: 0.8,
    },
    config: {
      mass: 0.5,
      tension: 280,
      friction: 12,
    },
  });

  return transitions((style, _) => (
    <container x={1920 / 2} y={1080 / 2}>
      <sprite label="对话框遮罩" src="new/mask.png" pivot={[0.5, 0.5]} anchor={[0.5, 0.5]} opacity={show ? 1 : 0} />
      <animated.sprite label="对话框" src="new2/对话框-小-bg.png" pivot={[0.5, 0.5]} anchor={[0.5, 0.5]} {...style}>
        <text
          label="对话框标题"
          text={title}
          fontSize={36}
          lineHeight={1.5}
          fillColor={TEXT_COLOR.DEFAULT_PRESS}
          pivot={[0.5, 0]}
          anchor={[0.5, 0]}
          x={0}
          y={10}
        />
        <text
          label="对话框内容"
          text={content}
          pivot={[0.5, 0]}
          anchor={[0.5, 0]}
          fontSize={36}
          lineHeight={1.5}
          fillColor={TEXT_COLOR.DEFAULT_IDLE}
          x={0}
          y={120}
        />
        {mode === 'alert' && (
          <Button
            fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
            label="对话框确认按钮"
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
            x={0}
            y={120}
            tint={TEXT_COLOR.PRIMARY_TINT}
            text="好的"
            color={[TEXT_COLOR.PRIMARY_IDLE, TEXT_COLOR.PRIMARY_HOVER, TEXT_COLOR.PRIMARY_PRESS]}
            mode="nineslice"
            bounds={[0.25, 0.25, 0.25, 0.25]}
            targetWidth={168}
            targetHeight={80}
            onClick={() => onConfirm?.()}
          />
        )}
        {mode === 'confirm' && (
          <>
            <Button
              fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
              label="对话框同意按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={-120}
              y={120}
              tint={TEXT_COLOR.PRIMARY_TINT}
              text="确定"
              color={[TEXT_COLOR.PRIMARY_IDLE, TEXT_COLOR.PRIMARY_HOVER, TEXT_COLOR.PRIMARY_PRESS]}
              mode="nineslice"
              bounds={[0.25, 0.25, 0.25, 0.25]}
              targetWidth={168}
              targetHeight={80}
              onClick={() => onConfirm?.(true)}
            />
            <Button
              fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
              label="对话框拒绝按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={120}
              y={120}
              text="取消"
              color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
              mode="nineslice"
              bounds={[0.25, 0.25, 0.25, 0.25]}
              targetWidth={168}
              targetHeight={80}
              onClick={() => onConfirm?.(false)}
            />
          </>
        )}
      </animated.sprite>
    </container>
  ));
}

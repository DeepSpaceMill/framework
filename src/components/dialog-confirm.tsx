import { type HaiNodeAttributes, animated, useSpring, useTransition } from '@hai/lib';
import React, { useEffect } from 'react';
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
    <animated.container pivot={[0.5, 0.5]} x={640} y={360} {...style}>
      <sprite label="对话框" src="new/对话框-小-bg.png" pivot={[0.5, 0]} anchor={[0.5, 0]} y={-155}>
        <text label="对话框标题" text={title} fontSize={32} lineHeight={1.5} fillColor={'white'} x={0} y={15} />
        <text
          label="对话框内容"
          text={content}
          pivot={[0.5, 0]}
          anchor={[0.5, 0]}
          fontSize={24}
          lineHeight={1.5}
          fillColor={'white'}
          x={0}
          y={100}
        />
        {mode === 'confirm' && (
          <Button
            fileName="dialog/btn_ok"
            label="对话框确认按钮"
            anchor={[0.5, 0]}
            x={0}
            y={230}
            onClick={() => onConfirm?.()}
          />
        )}
        {mode === 'alert' && (
          <>
            <Button
              fileName="dialog/btn_yes"
              label="对话框同意按钮"
              pivot={[0.5, 0]}
              anchor={[0.5, 0]}
              x={-120}
              y={230}
              onClick={() => onConfirm?.(true)}
            />
            <Button
              fileName="dialog/btn_no"
              label="对话框拒绝按钮"
              pivot={[0.5, 0]}
              anchor={[0.5, 0]}
              x={120}
              y={230}
              onClick={() => onConfirm?.(false)}
            />
          </>
        )}
      </sprite>
    </animated.container>
  ));
}

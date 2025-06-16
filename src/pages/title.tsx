import { type MoyuEvent, animated, moyu } from '@momoyu-ink/kit';
import React, { useContext, useEffect, useState } from 'react';

import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { uiTitle } from '../configs/uititle';
import { TEXT_COLOR } from '../constants';
import { useFadeIn, useFadeInOut } from '../hooks/useFadeInOut';
import { EntryContext } from '../entry';
import type { MouseEvent } from '@momoyu-ink/kit';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';
import { useSoundEffect } from '../hooks/useSoundEffect';

export function Title() {
  const [contentStyle, contentApi, contentSkip] = useFadeIn(500, true);

  const context = useContext(EntryContext);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  const playButtonSound = useSoundEffect('audio/a.mp3');

  const handleDialogConfirm = (yes?: boolean) => {
    console.info('点击了', yes ? '确定' : '取消');
    if (yes) {
      executePluginCommand('system', {
        subCommand: 'quit',
      });
    }
    setShowDialog(false);
  };

  const handleStart = (e: MouseEvent) => {
    contentApi.start({
      to: { opacity: 0 },
      delay: 0,
      onRest: () => {
        context?.setPage('stage');
      },
    });
    e.stopPropagation();
  };

  const handleExit = () => {
    setDialogContent('确定要退出游戏吗？');
    setDialogTitle('确认');
    setShowDialog(true);
  };

  useEffect(() => {
    contentApi.start({ pause: false });
  }, [contentApi]);

  return (
    <container label="title">
      <animated.container
        {...contentStyle}
        label="content"
        onClick={(e) => {
          if (e.targetId === e.currentTargetId) {
            contentSkip();
          }
        }}
      >
        <sprite src="new/bg.jpg" />

        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          text={'开始游戏'}
          fontSize={34}
          color={[
            TEXT_COLOR.DEFAULT_IDLE,
            TEXT_COLOR.DEFAULT_HOVER,
            TEXT_COLOR.DEFAULT_PRESS,
          ]}
          x={160}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={240}
          targetHeight={70}
          onClick={handleStart}
        />
        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          text={'设置'}
          fontSize={34}
          color={[
            TEXT_COLOR.DEFAULT_IDLE,
            TEXT_COLOR.DEFAULT_HOVER,
            TEXT_COLOR.DEFAULT_PRESS,
          ]}
          x={460}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={140}
          targetHeight={70}
          onClick={() => context.setOverlayPage('settings')}
        />

        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          text={'退出'}
          fontSize={34}
          color={[
            TEXT_COLOR.DEFAULT_IDLE,
            TEXT_COLOR.DEFAULT_HOVER,
            TEXT_COLOR.DEFAULT_PRESS,
          ]}
          x={1760}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={140}
          targetHeight={70}
          onClick={handleExit}
          onMouseEnter={playButtonSound}
        />
      </animated.container>
      <Dialog
        show={showDialog}
        title={dialogTitle}
        content={dialogContent}
        mode="confirm"
        onConfirm={handleDialogConfirm}
      />
    </container>
  );
}

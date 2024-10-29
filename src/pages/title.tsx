import { type HaiEvent, animated, hai } from '@hai/lib';
import React, { useContext, useState } from 'react';

import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { uiTitle } from '../configs/uititle';
import { TEXT_COLOR } from '../constants';
import { useFadeIn, useFadeInOut } from '../hooks/useFadeInOut';
import { EntryContext } from './entry';

export function Title() {
  const [contentStyle, contentApi, contentSkip] = useFadeIn(500, true);
  const [logoStyle, , logoSkip] = useFadeInOut(500, 1500, 1000, false, () => {
    contentApi.start({ pause: false });
  });

  const context = useContext(EntryContext);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  const handleDialogConfirm = (yes?: boolean) => {
    console.info('点击了', yes ? '确定' : '取消');
    if (yes) {
      hai.quit();
    }
    setShowDialog(false);
  };

  const handleStart = (e: HaiEvent) => {
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

  return (
    <container label="title" scale={1280 / 1920}>
      <animated.sprite {...logoStyle} src={uiTitle.logo} onClick={logoSkip} />
      <animated.container {...contentStyle} label="content" onClick={contentSkip}>
        <sprite src="new/bg.jpg" />

        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          text={'开始游戏'}
          fontSize={34}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
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
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={460}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={140}
          targetHeight={70}
        />

        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          text={'退出'}
          fontSize={34}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={1760}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={140}
          targetHeight={70}
          onClick={handleExit}
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

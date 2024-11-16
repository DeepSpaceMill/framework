import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { createRoot, hai, useTransition } from '@doufu-moe/kit';
import { Dialog } from './components/dialog';
import { ListButton } from './components/list-button';
import { TextWindow } from './components/textwindow';
import { SIDEBAR_HEIGHT, SIDEBAR_WIDTH } from './constants';
import { Entry } from './pages/entry';
import { MouseAndTouch } from './pages/mouse_touch';
import { NineSlice } from './pages/nineslice';
import { Position } from './pages/position';

function App() {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  const logError = (error: Error, info: { componentStack: string }) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  const list = ['项目1', '项目2', '项目3', '项目4', '项目5', '项目6', '项目7'];

  const transitions = useTransition(
    list.map((item, index) => ({ item, index })),
    {
      keys: (item) => item.item,
      from: { opacity: 0, x: -50 },
      enter: (item) => ({ opacity: 1, x: 0, delay: item.index * 80 }),
      leave: { opacity: 0, x: -50 },
    },
  );

  const handleTextWindowButtonClicked = (id: string) => {
    setDialogContent(`点击了${id}`);
    setDialogTitle('提示');
    setShowDialog(true);
  };

  const handleDialogConfirm = (yes?: boolean) => {
    console.info('点击了', yes ? '确定' : '取消');
    setShowDialog(false);
  };

  const handleListButtonClick = (index: number) => {
    if (index === 5) {
      console.log('点击了项目6');
      void (
        hai.executePluginCommand('audio', {
          subCommand: 'load',
          name: 'test',
          src: 'audio/test.ogg',
          autoPlay: false,
        }) as Promise<void>
      ).then(() => {
        console.log('audio loaded');
      });
    } else if (index === 6) {
      console.log('点击了项目7');
      void hai.executePluginCommand('audio', {
        subCommand: 'setVolume',
        name: 'test',
        volume: 1.0,
      });
      void hai.executePluginCommand('audio', {
        subCommand: 'play',
        name: 'test',
      });
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <container label="App">
        <sprite label="背景图" src="classroom1.png" scale={1280 / 1344} />
        <TextWindow onItemClicked={handleTextWindowButtonClicked} />
        <Dialog
          show={showDialog}
          title={dialogTitle}
          content={dialogContent}
          mode="confirm"
          onConfirm={handleDialogConfirm}
        />
        <container label="列表容器" x={0} y={0}>
          <sprite label="列表底纹" src="mask.png" scaleX={200} scaleY={420} />
          {transitions((style, { item, index }) => (
            <ListButton
              style={style}
              label={`item-${index}`}
              title={item}
              index={index}
              onClick={handleListButtonClick}
            />
          ))}
        </container>
      </container>
    </ErrorBoundary>
  );
}

function App2() {
  const [current, setCurrent] = useState(0);

  const logError = (error: Error, info: { componentStack: string }) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  const list = [
    {
      name: '鼠标和触摸',
      component: MouseAndTouch,
    },
    {
      name: '元素定位',
      component: Position,
    },
    {
      name: '九宫格',
      component: NineSlice,
    },
  ];

  const transitions = useTransition(
    list.map((item, index) => ({ item, index })),
    {
      keys: (item) => item.item.name,
      from: { opacity: 0, x: -50 },
      enter: (item) => ({ opacity: 1, x: 0, delay: item.index * 80 }),
      leave: { opacity: 0, x: -50 },
    },
  );

  const handleListButtonClick = (index: number) => {
    setCurrent(index);
  };

  const item = list[current];

  const Component = item.component;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <sprite label="背景图" src="classroom1.png" scale={1280 / 1344} />
      <container label="App">
        <sprite label="列表底纹" src="mask.png" scaleX={SIDEBAR_WIDTH} scaleY={SIDEBAR_HEIGHT} />
        {transitions((style, { item, index }) => (
          <ListButton
            style={style}
            label={`item-${index}`}
            title={item.name}
            index={index}
            onClick={handleListButtonClick}
          />
        ))}
      </container>
      <container x={SIDEBAR_WIDTH} y={0}>
        <Component key={item.name} />
      </container>
    </ErrorBoundary>
  );
}

function ErrorFallback() {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <container>
      <sprite label="背景图" src="classroom1.png" scale={1280 / 1344} />
    </container>
  );
}

function Main() {
  const logError = (error: Error, info: { componentStack: string }) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  // return (
  //   <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
  //     <container label="App">
  //       <sprite label="背景图" src="new/对话框-小-bg.png" />
  //       <sprite label="aaaa" src="new/hover.png" x={200} y={80} />
  //     </container>
  //   </ErrorBoundary>
  // );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <Entry />
      {/* <App2 /> */}
      {/* <App /> */}
      {/* <sprite src="image/Sample_BGD.png" />
      <sprite src="image/title_button_02.png" x={425} y={375} />
      <sprite src="test2.png" x={425} y={275} />
      <sprite src="test3.png" x={525} y={275} />
      <sprite src="test4.png" x={625} y={275} />
      <sprite src="test5.png" x={725} y={275} /> */}
    </ErrorBoundary>
  );
}

const root = createRoot();

root.render(<Main />);

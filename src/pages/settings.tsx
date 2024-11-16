import type { Node } from '@doufu-moe/kit';
import React, { useRef, useState } from 'react';
import { TEXT_COLOR } from '../constants';
import { Select } from '../components/select';
import { Slider } from '../components/slider';

export function Settings() {
  const textWindowRef = useRef<Node>(null);

  const [display, setDisplay] = useState('1080');

  const handleClick = () => {
    console.log('setting bg click');
    textWindowRef.current?.executeCommand({
      subCommand: 'setText',
      text: '测试文字测试文字测试文字测试文字，测试文字测试文字',
    });
  };
  return (
    <container onClick={handleClick}>
      <sprite label="透明遮罩" src="new2/transparent-full.png" />
      <sprite label="背景图" src="new2/bg.png" pivot={[0.5, 0.5]} x={960} y={540} />
      <text
        label="标题"
        text="设置"
        fontSize={64}
        fillColor="white"
        x={180}
        y={75}
        stroke
        strokeColor={TEXT_COLOR.DEFAULT_IDLE}
        strokeWidth={5}
      />

      <container x={120} y={200} scale={1280 / 1920}>
      <container x={180} y={300}>
        <text text="窗口尺寸" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
        <Select
          x={180}
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          fontSize={32}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={360}
          targetHeight={54}
          value={display}
          options={[
            { text: '全屏（独占）', value: 'fullscreen' },
            { text: '全屏（无边框窗口）', value: 'fullscreen2' },
            { text: '1920 x 1080', value: '1080' },
            { text: '1280 x 720', value: '720' },
          ]}
          onSelect={(value) => setDisplay(value)}
        />
      </container>

      {/* <container label="文本框容器">
        <sprite label="文本框" src="new2/文本框-小.png" scale={1280 / 1920} pivot={[0.5, 1]} x={640} y={690}>
          <text
            label="对话内容"
            ref={textWindowRef}
            text="测试文字测试文字测试文字测试文字，测试文字测试文字"
            fontSize={36}
            lineHeight={1}
            fillColor="white"
            x={166}
            y={140}
            stroke
            strokeColor="#0e2a59"
            strokeWidth={3}
            printMode="typewriter"
            printSpeed={20}
          />
        </sprite>
      </container> */}
    </container>
  );
}

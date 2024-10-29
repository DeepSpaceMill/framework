import type { Node } from '@hai/lib';
import React, { useRef } from 'react';

export function Stage() {
  const textWindowRef = useRef<Node>(null);

  const handleClick = () => {
    console.log('click');
    textWindowRef.current?.executeCommand({
      subCommand: 'setText',
      text: '测试文字测试文字测试文字测试文字，测试文字测试文字',
    });
  };
  return (
    <container onClick={handleClick}>
      <sprite label="背景图" src="classroom1.png" scale={1280 / 1344} />
      <container label="立绘容器">
        {/* <sprite label="立绘-中" src="fgimage/fg01_01.png" pivot={[0.5, 1]} x={640} y={720} /> */}
        <sprite label="立绘-右" src="fgimage/fg01_01.png" tint="#333" pivot={[1, 1]} x={1280} y={720} />
        <sprite label="立绘-左" src="fgimage/fg03_01.png" pivot={[0, 1]} x={0} y={720} />
      </container>
      <container label="文本框容器">
        <sprite label="文本框" src="new2/文本框-小.png" scale={1280 / 1920} pivot={[0.5, 1]} x={640} y={690}>
          <text
            label="姓名"
            text="???"
            fontSize={72}
            lineHeight={1}
            fillColor="white"
            x={166}
            y={24}
            stroke
            strokeColor="#0e2a59"
            strokeWidth={3}
          />
          <text
            label="姓名-副"
            text="眼熟的女生"
            fontSize={36}
            lineHeight={1}
            fillColor="#1cc6fe"
            x={320}
            y={66}
            stroke
            strokeColor="#0e2a59"
            strokeWidth={3}
          />
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
      </container>
    </container>
  );
}

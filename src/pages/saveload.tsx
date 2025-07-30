import type { Node } from '@momoyu-ink/kit';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { TEXT_COLOR } from '../constants';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { EntryContext } from '../entry';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';
import { Button } from '../components/button';
import { Checkbox } from '../components/checkbox';

export interface SaveLoadProps {
  type: 'save' | 'load';
}

export function SaveLoad(props: SaveLoadProps) {
  const context = useContext(EntryContext);
  const textWindowRef = useRef<Node>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const { type } = props;

  const handleExit = () => {
    context.setOverlayPage(null);
  };

  return (
    <container>
      <sprite
        label="透明遮罩"
        src="ui/mask-transparent.png"
        onClick={handleExit}
      />
      <sprite
        label="背景图"
        src="ui/sl_bg.png"
        pivot={[0.5, 0.5]}
        x={960}
        y={540}
      >
        <text
          label="标题"
          text={type?.toUpperCase()}
          fontSize={48}
          fillColor="white"
          x={64}
          y={54}
        />
        <Button
          fileNames={[
            'ui/sl_close.png',
            'ui/sl_close_hover.png',
            'ui/sl_close_press.png',
          ]}
          x={1532}
          y={62}
          onClick={handleExit}
        />
        <container x={606} y={60}>
          {[...Array(5)].map((_, index) => (
            <Button
              fileNames={[
                'ui/sl_nav.png',
                'ui/sl_nav_hover.png',
                'ui/sl_nav_press.png',
              ]}
              x={78 * index}
              text={`${index + 1}`}
              color={currentPage === index ? 'black' : 'white'}
              lockOn={currentPage === index ? 'press' : undefined}
              onClick={() => {
                setCurrentPage(index);
              }}
            />
          ))}
        </container>
        <container x={94} y={146}>
          {(
            [
              [0, 0, true],
              [722, 0, true],
              [0, 140, true],
              [722, 140, false],
              [0, 280, false],
              [722, 280, false],
              [0, 420, false],
              [722, 420, false],
              [0, 560, false],
              [722, 560, false],
            ] as [number, number, boolean][]
          ).map((data, index) => (
            <container x={data[0]} y={data[1]} key={index}>
              <Button
                fileNames={[
                  'ui/sl_item.png',
                  'ui/sl_item_hover.png',
                  'ui/sl_item_press.png',
                ]}
                interactive={data[2] || type === 'save'}
              />
              {!data[2] && (
                <container interactive={false}>
                  <text
                    text="NO DATA"
                    fontSize={32}
                    lineHeight={1.5}
                    fillColor={TEXT_COLOR.DEFAULT_IDLE}
                    pivot={[0.5, 0.5]}
                    x={712 / 2}
                    y={130 / 2}
                  />
                </container>
              )}
              {data[2] && (
                <container interactive={false}>
                  <sprite src="non-free/snapshot.png" x={2} y={2} />
                  <text
                    text={`存档 ${index + 1}`}
                    fontSize={28}
                    lineHeight={1.2}
                    fillColor={TEXT_COLOR.DEFAULT_IDLE}
                    x={250}
                    y={7}
                  />
                  <text
                    text={`这是一行示例文字，你能通过它看到文字的基础样式、字距、行距、换行，以及各种富文本功能，如颜色变化或添加装饰。`}
                    fontSize={20}
                    lineHeight={1.3}
                    boxWidth={442}
                    boxHeight={52}
                    fillColor={TEXT_COLOR.DEFAULT_IDLE}
                    x={250}
                    y={50}
                  />
                  <text
                    text={`2025\\/07\\/26 18:11:45`}
                    fontSize={16}
                    lineHeight={1.2}
                    fillColor={TEXT_COLOR.DEFAULT_IDLE}
                    pivot={[1, 0]}
                    x={689}
                    y={104}
                  />
                </container>
              )}
            </container>
          ))}
        </container>
      </sprite>
    </container>
  );
}

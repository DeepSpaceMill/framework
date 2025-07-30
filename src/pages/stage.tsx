import { addEventListener, MouseEvent, type Node } from '@momoyu-ink/kit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScenario } from '../hooks/useScenario';
import { Button } from '../components/button';

enum TextBoxButton {
  SAVE = 'SAVE',
  LOAD = 'LOAD',
  AUTO = 'AUTO',
  SKIP = 'SKIP',
  HIST = 'HIST',
  CONF = 'CONF',
}

export function Stage() {
  const textWindowRef = useRef<Node>(null);
  const progress = useRef(0);

  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [textBoxEntered, setTextBoxEntered] = useState(false);
  const [hideTextBox, setHideTextBox] = useState(false);

  const stories = useMemo(() => ['example'], []);
  const nextLine = useScenario(stories, 'example');

  const handleClick = () => {
    if (hideTextBox) {
      setHideTextBox(false);
      return;
    }

    if (progress.current < 1) {
      textWindowRef.current?.executeCommand({
        subCommand: 'finishPrinting',
      });
      progress.current = 1;
    } else {
      nextLine();
    }
  };

  const handleMouseEnter = (e: MouseEvent) => {
    setTextBoxEntered(true);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    setTextBoxEntered(false);
  };

  useEffect(() => {
    return addEventListener('scenarionextline', (e) => {
      console.log('line', JSON.stringify(e));
      if (e.type === 'commandline') {
      } else if (e.type === 'text') {
        setName(e.leading || '');
        setText(e.text || '');
      } else if (e.type === 'extrasystemcall') {
      } else if (e.type === 'finished') {
      } else {
        console.warn('Unknown event type:', e.type);
      }
    });
  }, []);

  return (
    <container onClick={handleClick}>
      <sprite
        label="背景图"
        src="non-free/classroom1.png"
        scale={1920 / 1344}
      />
      <container label="立绘容器">
        <sprite
          label="立绘-右"
          src="non-free/fg01_01.png"
          tint={name === '角色A' ? '#333' : '#fff'}
          pivot={[1, 1]}
          scale={1.5}
          x={1920}
          y={1080}
        />
        <sprite
          label="立绘-左"
          src="non-free/fg03_01.png"
          tint={name === '角色B' ? '#333' : '#fff'}
          pivot={[0, 1]}
          scale={1.5}
          x={0}
          y={1080}
        />
        <sprite
          label="立绘-中"
          src="non-free/fg02_01.png"
          pivot={[0.5, 1]}
          scale={1.5}
          x={1920 / 2}
          y={1080}
        />
      </container>
      <container
        label="文本框容器"
        visible={!hideTextBox}
        interactive={!hideTextBox}
      >
        <sprite
          label="文本框"
          src="ui/textbox.png"
          x={206}
          y={830}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Button
            fileNames={[
              'ui/textbox_close.png',
              'ui/textbox_close_hover.png',
              'ui/textbox_close_press.png',
            ]}
            x={1466}
            y={18}
            onClick={() => {
              console.log('Close button clicked');
              setHideTextBox(true);
            }}
            visible={textBoxEntered}
          />
          <container x={840} y={158} visible={textBoxEntered}>
            {[
              TextBoxButton.SAVE,
              TextBoxButton.LOAD,
              TextBoxButton.AUTO,
              TextBoxButton.SKIP,
              TextBoxButton.HIST,
              TextBoxButton.CONF,
            ].map((button, index) => (
              <Button
                fileNames={[
                  `ui/textbox_button.png`,
                  `ui/textbox_button.png`,
                  `ui/textbox_button.png`,
                ]}
                x={100 * index}
                text={button}
                fontSize={24}
                color={[
                  'rgba(255,255,255,0.3)',
                  'rgba(255,255,255,0.7)',
                  'rgba(255,255,255,0.9)',
                ]}
                onClick={() => {
                  console.log(`Button ${button} clicked`);
                }}
              />
            ))}
          </container>

          <text
            label="对话内容"
            ref={textWindowRef}
            text={text}
            fontSize={32}
            lineHeight={1.5}
            boxWidth={1384}
            boxHeight={110}
            fillColor="#f0f0f0"
            x={72}
            y={54}
            printMode="typewriter"
            printSpeed={20}
            onStart={() => {
              progress.current = 0;
            }}
            onProgress={(v) => {
              progress.current = v;
            }}
            onFinish={() => {
              progress.current = 1;
            }}
            interactive={false}
          />
        </sprite>
        <sprite
          label="姓名框"
          src="ui/namebox.png"
          x={278}
          y={794}
          anchor={[0.5, 0.5]}
          opacity={name.length > 0 ? 1 : 0}
        >
          <text
            label="姓名"
            text={name}
            fontSize={32}
            lineHeight={1.5}
            fillColor="#f0f0f0"
            anchor={[0.5, 0.5]}
            pivot={[0.5, 0.5]}
            x={0}
            y={0}
          />
        </sprite>
      </container>
    </container>
  );
}

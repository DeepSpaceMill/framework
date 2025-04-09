import type { Node } from '@momoyu-ink/kit';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { TEXT_COLOR } from '../constants';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { EntryContext } from '../entry';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';

const PREVIEW_TEXT = '测试文字测试文字测试文字测试文字，测试文字测试文字';

export interface SettingsData {
  display: string;
  volume_bgm: number;
  volume_se: number;
  volume_voice: number;
  text_speed: number;
  auto_interval: number;
  skip_voice: boolean;
}

export function Settings() {
  const context = useContext(EntryContext);
  const textWindowRef = useRef<Node>(null);

  const [settings, setSettings] = useState(() => {
    const data = executePluginCommand('scenario', {
      subCommand: 'getGlobalData',
    }) as SettingsData;

    let settings: SettingsData;
    if (data instanceof Map) {
      settings = Object.fromEntries(data);
    } else {
      settings = data;
    }

    // set default values
    if (Object.keys(settings).length === 0) {
      Object.assign(settings, {
        display: '720',
        volume_bgm: 1,
        volume_se: 0.5,
        volume_voice: 1,
        text_speed: 1,
        auto_interval: 0.8,
        skip_voice: false,
      });
    }

    return settings;
  });

  useEffect(() => {
    // do nothing if display is not set
    if (!settings.display) {
      return;
    }

    if (settings.display === 'fullscreen') {
      executePluginCommand('system', {
        subCommand: 'setWindowState',
        state: 'fullscreen',
      });
    } else {
      executePluginCommand('system', {
        subCommand: 'setWindowState',
        state: 'idle',
      });
      if (settings.display === '1080') {
        executePluginCommand('system', {
          subCommand: 'setWindowSize',
          width: 1920,
          height: 1080,
        });
      } else if (settings.display === '720') {
        executePluginCommand('system', {
          subCommand: 'setWindowSize',
          width: 1280,
          height: 720,
        });
      }
    }
  }, [settings.display]);

  const handlePreviewClick = () => {
    console.log('setting bg click');
    textWindowRef.current?.executeCommand({
      subCommand: 'setText',
      text: PREVIEW_TEXT,
    });
  };

  const handleExit = () => {
    context.setOverlayPage(null);
  };

  const setValue = (key: keyof SettingsData, value: any) => {
    setSettings((prev: SettingsData) => {
      const next: SettingsData = { ...prev, [key]: value };

      setTimeout(async () => {
        await executePluginCommand('scenario', {
          subCommand: 'saveGlobalData',
          data: next,
        });
      }, 0);

      return next;
    });
  };

  return (
    <container>
      <sprite label="透明遮罩" src="new2/transparent-full.png" onClick={handleExit} />
      <sprite label="背景图" src="new2/bg.png" pivot={[0.5, 0.5]} x={960} y={540}>
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

        <container x={180} y={390}>
          <text text="背景音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            targetWidth={360}
            targetHeight={54}
            value={settings.volume_bgm}
            onChange={(v) => setValue('volume_bgm', v)}
          />
        </container>

        <container x={180} y={480}>
          <text text="音效音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            targetWidth={360}
            targetHeight={54}
            value={settings.volume_se}
            onChange={(v) => setValue('volume_se', v)}
          />
        </container>

        <container x={180} y={570}>
          <text text="语音音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            targetWidth={360}
            targetHeight={54}
            value={settings.volume_voice}
            onChange={(v) => setValue('volume_voice', v)}
          />
        </container>

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
            value={settings.display}
            options={[
              { text: '全屏（无边框窗口）', value: 'fullscreen' },
              { text: '1920 x 1080', value: '1080' },
              { text: '1280 x 720', value: '720' },
            ]}
            onSelect={(value) => setValue('display', value)}
          />
        </container>

        <container x={900} y={300}>
          <text text="文字速度" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            targetWidth={360}
            targetHeight={54}
            value={settings.text_speed}
            onChange={(v) => setValue('text_speed', v)}
          />
        </container>

        <container x={900} y={390}>
          <text text="自动间隔" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            targetWidth={360}
            targetHeight={54}
            value={settings.auto_interval}
            onChange={(v) => setValue('auto_interval', v)}
          />
        </container>

        <container x={900} y={480}>
          <text text="跳过语音" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          {/* <Slider x={180} targetWidth={360} targetHeight={54} /> */}
        </container>

        <container label="文本框容器" x={262} y={480 + 300} onClick={handlePreviewClick}>
          <sprite
            label="文本框"
            mode="nineslice"
            bounds={[0.1, 0.1, 0.1, 0.1]}
            src="new2/文本框-小.png"
            targetWidth={1200}
            targetHeight={120}
          >
            <text
              label="对话内容"
              ref={textWindowRef}
              text={PREVIEW_TEXT}
              fontSize={36}
              lineHeight={1}
              fillColor="#444444"
              x={72}
              y={28}
              stroke
              strokeColor="#ddd"
              strokeWidth={3}
              printMode="typewriter"
              printSpeed={20}
            />
          </sprite>
        </container>
      </sprite>
    </container>
  );
}

import type { Node } from '@momoyu-ink/kit';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '../components/button';
import { Checkbox } from '../components/checkbox';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { TEXT_COLOR } from '../constants';
import { EntryContext } from '../entry';
import { useSoundEffect } from '../hooks/useSoundEffect';

const PREVIEW_TEXT = '点击这里预览文本框的效果设置';

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

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.ogg');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.ogg');

  const [settings, setSettings] = useState(() => {
    const data = executePluginCommand('scenario', {
      subCommand: 'getPermanentVariables',
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
    backButtonSound();
    setTimeout(() => {
      context.setOverlayPage(null);
    }, 100);
  };

  const setValue = (key: keyof SettingsData, value: any) => {
    setSettings((prev: SettingsData) => {
      const next: SettingsData = { ...prev, [key]: value };

      setTimeout(async () => {
        await executePluginCommand('scenario', {
          subCommand: 'setPermanentVariables',
          variables: next,
        });
      }, 0);

      return next;
    });
  };

  return (
    <container>
      <sprite label="透明遮罩" src="ui/mask-transparent.png" onClick={handleExit} />
      <sprite label="背景图" src="ui/sl_bg.png" pivot={[0.5, 0.5]} x={960} y={540}>
        <text label="标题" text="SETTINGS" fontSize={48} fillColor="white" x={64} y={54} />
        <Button
          fileNames={['ui/sl_close.png', 'ui/sl_close_hover.png', 'ui/sl_close_press.png']}
          x={1532}
          y={62}
          onClick={handleExit}
        />

        <container x={180} y={390}>
          <text text="背景音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            y={7}
            targetWidth={401}
            targetHeight={40}
            value={settings.volume_bgm}
            onChange={(v) => setValue('volume_bgm', v)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={180} y={480}>
          <text text="音效音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            y={7}
            targetWidth={401}
            targetHeight={40}
            value={settings.volume_se}
            onChange={(v) => setValue('volume_se', v)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={180} y={570}>
          <text text="语音音量" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            y={7}
            targetWidth={401}
            targetHeight={40}
            value={settings.volume_voice}
            onChange={(v) => setValue('volume_voice', v)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={180} y={300}>
          <text text="窗口尺寸" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Select
            x={180}
            fileName={['ui/dialog_confirm.png', 'ui/dialog_confirm_hover.png', 'ui/dialog_confirm_press.png']}
            fontSize={32}
            color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
            mode="nineslice"
            bounds={[0.25, 0.25, 0.25, 0.25]}
            targetWidth={401}
            targetHeight={54}
            value={settings.display}
            options={[
              { text: '全屏（无边框窗口）', value: 'fullscreen' },
              { text: '1920 x 1080', value: '1080' },
              { text: '1280 x 720', value: '720' },
            ]}
            onSelect={(value) => setValue('display', value)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={900} y={300}>
          <text text="文字速度" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            y={7}
            targetWidth={401}
            targetHeight={40}
            value={settings.text_speed}
            onChange={(v) => setValue('text_speed', v)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={900} y={390}>
          <text text="自动间隔" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Slider
            x={180}
            y={7}
            targetWidth={401}
            targetHeight={40}
            value={settings.auto_interval}
            onChange={(v) => setValue('auto_interval', v)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container x={900} y={480}>
          <text text="跳过语音" fontSize={36} fillColor={TEXT_COLOR.DEFAULT_IDLE} />
          <Checkbox
            x={180}
            y={3}
            mode="nineslice"
            bounds={[0.01, 0.01, 0.98, 0.01]}
            targetWidth={401}
            targetHeight={48}
            checked={settings.skip_voice}
            onChange={(checked) => setValue('skip_voice', checked)}
            onMouseEnter={hoverButtonSound}
          />
        </container>

        <container label="文本框容器" x={262} y={680} onClick={handlePreviewClick}>
          <sprite label="文本框" src="ui/settings_preview.png" anchor={[0.5, 0.5]} cursor="pointer">
            <text
              label="对话内容"
              ref={textWindowRef}
              text={PREVIEW_TEXT}
              fontSize={36}
              fillColor={TEXT_COLOR.DEFAULT_IDLE}
              anchor={[0.5, 0.5]}
              pivot={[0.5, 0.5]}
              printMode="typewriter"
              printSpeed={20}
              interactive={false}
            />
          </sprite>
        </container>
      </sprite>
    </container>
  );
}

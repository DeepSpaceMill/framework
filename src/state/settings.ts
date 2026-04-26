import { executePluginCommand, setDefaultAutoTailMs } from '@momoyu-ink/kit';
import debounce from 'lodash.debounce';
import { proxy, subscribe } from 'valtio';
import { subscribeKey } from 'valtio/utils';
import {
  BGM_AUDIO_CHANNEL,
  SFX_AUDIO_CHANNEL,
  SOUND_AUDIO_CHANNEL_WILDCARD,
  VOICE_AUDIO_CHANNEL_WILDCARD,
} from '../lib/audioChannels';

export interface SettingsData extends Record<string, any> {
  display: string;
  volume_bgm: number;
  volume_se: number;
  volume_voice: number;
  text_speed: number;
  auto_interval: number;
  skip_voice: boolean;
}

// load settings from permanent variables
const data = executePluginCommand('scenario', {
  subCommand: 'getPermanentVariable',
  key: 'settings',
}) as SettingsData;

// global settings object
let _settings: SettingsData;

// compatibility with Map
if (data instanceof Map) {
  _settings = Object.fromEntries(data);
} else {
  _settings = data ?? {};
}

// set default values
if (Object.keys(_settings).length === 0) {
  Object.assign(_settings, {
    display: '720',
    volume_bgm: 1,
    volume_se: 0.5,
    volume_voice: 1,
    text_speed: 1,
    auto_interval: 0.8,
    skip_voice: false,
  });
}

// apply display settings on load
setDisplay(_settings.display);

// create proxy state
export const settingsState = proxy<SettingsData>(_settings);

setDefaultAutoTailMs(Number.isFinite(settingsState.auto_interval) ? settingsState.auto_interval * 1000 : 0);

// Keep framework-managed audio channel names aligned with the engine wildcard
// matcher so settings changes apply to both base channels and derived channels.
executePluginCommand('audio', {
  subCommand: 'setGlobalVolume',
  name: BGM_AUDIO_CHANNEL,
  volume: settingsState.volume_bgm,
});
executePluginCommand('audio', {
  subCommand: 'setGlobalVolume',
  name: SFX_AUDIO_CHANNEL,
  volume: settingsState.volume_se,
});
executePluginCommand('audio', {
  subCommand: 'setGlobalVolume',
  name: SOUND_AUDIO_CHANNEL_WILDCARD,
  volume: settingsState.volume_se,
});
executePluginCommand('audio', {
  subCommand: 'setGlobalVolume',
  name: VOICE_AUDIO_CHANNEL_WILDCARD,
  volume: settingsState.volume_voice,
});

// subscribe to changes and save to permanent variables
const saveSettings = debounce(() => {
  executePluginCommand('scenario', {
    subCommand: 'setPermanentVariable',
    key: 'settings',
    value: _settings,
  });
}, 300);
subscribe(settingsState, () => {
  saveSettings();
});

// subscribe to display changes and apply
subscribeKey(settingsState, 'display', (display) => {
  setDisplay(display);
});

subscribeKey(settingsState, 'auto_interval', (autoInterval) => {
  setDefaultAutoTailMs(Number.isFinite(autoInterval) ? autoInterval * 1000 : 0);
});

subscribeKey(settingsState, 'volume_bgm', (volume) => {
  executePluginCommand('audio', {
    subCommand: 'setGlobalVolume',
    name: BGM_AUDIO_CHANNEL,
    volume,
  });
});

subscribeKey(settingsState, 'volume_se', (volume) => {
  executePluginCommand('audio', {
    subCommand: 'setGlobalVolume',
    name: SFX_AUDIO_CHANNEL,
    volume,
  });
  executePluginCommand('audio', {
    subCommand: 'setGlobalVolume',
    name: SOUND_AUDIO_CHANNEL_WILDCARD,
    volume,
  });
});

subscribeKey(settingsState, 'volume_voice', (volume) => {
  executePluginCommand('audio', {
    subCommand: 'setGlobalVolume',
    name: VOICE_AUDIO_CHANNEL_WILDCARD,
    volume,
  });
});

function setDisplay(display: string) {
  // do nothing if display is not set
  if (!display) {
    return;
  }

  if (display === 'fullscreen') {
    executePluginCommand('system', {
      subCommand: 'setWindowState',
      state: 'fullscreen',
    });
  } else {
    executePluginCommand('system', {
      subCommand: 'setWindowState',
      state: 'idle',
    });
    if (display === '1080') {
      executePluginCommand('system', {
        subCommand: 'setWindowSize',
        width: 1920,
        height: 1080,
      });
    } else if (display === '720') {
      executePluginCommand('system', {
        subCommand: 'setWindowSize',
        width: 1280,
        height: 720,
      });
    }
  }
}

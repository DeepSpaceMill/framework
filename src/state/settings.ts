import { executePluginCommand } from '@momoyu-ink/kit';
import debounce from 'lodash.debounce';
import { proxy, subscribe } from 'valtio';
import { subscribeKey } from 'valtio/utils';

export interface SettingsData {
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
  subCommand: 'getPermanentVariables',
}) as SettingsData;

// global settings object
let _settings: SettingsData;

// compatibility with Map
if (data instanceof Map) {
  _settings = Object.fromEntries(data);
} else {
  _settings = data;
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

// subscribe to changes and save to permanent variables
const saveSettings = debounce(() => {
  executePluginCommand('scenario', {
    subCommand: 'setPermanentVariables',
    variables: _settings,
  });
}, 300);
subscribe(settingsState, () => {
  saveSettings();
});

// subscribe to display changes and apply
subscribeKey(settingsState, 'display', (display) => {
  setDisplay(display);
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

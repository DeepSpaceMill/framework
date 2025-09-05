import React, { createContext } from 'react';
import { uiActions } from './state/ui';
import { SaveLoad } from './pages/saveload';
import { Settings } from './pages/settings';
import { Stage } from './pages/stage';
import { Title } from './pages/title';
import { Dialog } from './components/dialog';
import { type GamePage, type OverlayType } from './state/ui';

export const pages: Record<GamePage, React.FC> = {
  title: Title,
  stage: Stage,
  cg: () => null,
  bgm: () => null,
  credits: () => null,
};

export const overlayComponents: Record<OverlayType, React.FC<any>> = {
  save: () => React.createElement(SaveLoad, { type: 'save' }),
  load: () => React.createElement(SaveLoad, { type: 'load' }),
  settings: Settings,
  menu: () => null,
  history: () => null,
  confirm: (props: any) =>
    React.createElement(Dialog, {
      mode: 'confirm',
      show: true,
      content: props.message || '',
      onConfirm: props.onConfirm,
    }),
};

export const EntryContext = createContext(uiActions);

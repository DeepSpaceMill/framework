import React from 'react';
import { createContext, useEffect, useState } from 'react';

import { Stage } from './pages/stage';
import { Title } from './pages/title';
import { Settings } from './pages/settings';
import { LogoPage } from './pages/logo';

export const EntryContext = createContext({
  setPage: (page: GamePage) => {},
  setOverlayPage: (page: GamePage | null) => {},
});

export type GamePage = 'logo' | 'title' | 'stage' | 'save' | 'load' | 'settings' | 'cg' | 'bgm';

const pages: Record<GamePage, React.FC> = {
  logo: () => <LogoPage src="logo.png" />,
  title: Title,
  stage: Stage,
  save: () => null,
  load: () => null,
  settings: Settings,
  cg: () => null,
  bgm: () => null,
};

export function Entry() {
  const [page, setPage] = useState<GamePage>('logo');
  const [overlayPage, setOverlayPage] = useState<GamePage | null>(null);

  const Page = pages[page];
  const Overlay = overlayPage ? pages[overlayPage] : null;

  const context = {
    setPage,
    setOverlayPage,
  };

  return (
    <EntryContext.Provider value={context}>
      <Page />
      {Overlay && <Overlay />}
    </EntryContext.Provider>
  );
}

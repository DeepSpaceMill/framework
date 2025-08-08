import React, { createContext, useState } from 'react';
import { SaveLoad } from './pages/saveload';
import { Settings } from './pages/settings';
import { Stage } from './pages/stage';
import { Title } from './pages/title';

export const EntryContext = createContext({
  setPage: (_page: GamePage) => {},
  setOverlayPage: (_page: GamePage | null) => {},
});

export type GamePage = 'title' | 'stage' | 'save' | 'load' | 'settings' | 'cg' | 'bgm';

const pages: Record<GamePage, React.FC> = {
  title: Title,
  stage: Stage,
  save: () => <SaveLoad type="save" />,
  load: () => <SaveLoad type="load" />,
  settings: Settings,
  cg: () => null,
  bgm: () => null,
};

export function Entry() {
  const [page, setPage] = useState<GamePage>('title');
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

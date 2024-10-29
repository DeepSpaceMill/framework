import type React from 'react';
import { createContext, useEffect, useState } from 'react';

import { Stage } from './stage';
import { Title } from './title';

export const EntryContext = createContext({
  setPage: (page: GamePage) => {},
});

export type GamePage = 'title' | 'stage' | 'save' | 'load' | 'setting' | 'cg' | 'bgm';

const pages: Record<GamePage, React.FC> = {
  title: Title,
  stage: Stage,
  save: () => null,
  load: () => null,
  setting: () => null,
  cg: () => null,
  bgm: () => null,
};

export function Entry() {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<GamePage>('title');

  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 200);
  }, []);

  const Page = pages[page];

  const context = {
    setPage,
  };

  return (
    <EntryContext.Provider value={context}>
      <Page />
    </EntryContext.Provider>
  );
}

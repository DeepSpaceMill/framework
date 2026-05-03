import { createStackNavigator, createStaticNavigation, RegisterNavigator } from '@momoyu-ink/kit';
import { SaveLoad } from './pages/saveload';
import { Settings } from './pages/settings';
import { Stage } from './pages/stage';
import { Dialog } from './components/dialog';
import { Menu } from './pages/menu';
import { Title } from './pages/title';
import { Backlog } from './pages/backlog';

// Initialize the navigator singleton
export const navigator = createStackNavigator({
  initialPage: 'title',
  pages: {
    title: Title,
    stage: {
      component: Stage,
      requiredParams: ['story', 'entry', 'isNewGame'],
    },
    cg: () => null,
    bgm: () => null,
    credits: () => null,
  },
  overlays: {
    saveload: {
      component: SaveLoad,
      requiredParams: ['type'],
    },
    settings: Settings,
    menu: Menu,
    backlog: Backlog,
    confirm: {
      component: Dialog,
      requiredParams: ['message'],
    },
  },
});

export const Navigation = createStaticNavigation(navigator);

// Register types for global navigator
declare module '@momoyu-ink/kit' {
  interface RootNavigatorList extends RegisterNavigator<typeof navigator> {}
}

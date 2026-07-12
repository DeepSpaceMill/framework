import { useCallback, useLayoutEffect } from 'react';
import { animated } from '@momoyu-ink/kit';
import { gameState, type FreeSpriteNode, useGameStateSection, useGameStateStore } from '../state/game';
import { Sprite } from '../components/sprite';

const ROOT_KEY = '__free-sprite-root__';
const EMPTY_SPRITE_KEY = '__free-sprite-empty__';

function buildChildMap<TNode extends { name: string; parent?: string; zIndex: number; order: number }>(
  nodes: Record<string, TNode>,
) {
  const childMap = new Map<string, TNode[]>();

  for (const node of Object.values(nodes)) {
    const parentKey = node.parent ?? ROOT_KEY;
    const list = childMap.get(parentKey);
    if (list) {
      list.push(node);
    } else {
      childMap.set(parentKey, [node]);
    }
  }

  for (const list of childMap.values()) {
    list.sort((a, b) => {
      if (a.zIndex !== b.zIndex) {
        return a.zIndex - b.zIndex;
      }

      return a.order - b.order;
    });
  }

  return childMap;
}

function getTransitionKey(node: FreeSpriteNode): string {
  if (!node.visible || node.presence === 'entering' || node.presence === 'leaving') {
    return EMPTY_SPRITE_KEY;
  }

  return `${node.name}:${node.resource.src}`;
}

function cleanupLeavingSubtree(name: string) {
  for (const child of Object.values(gameState.freeSprite.nodes)) {
    if (child.parent === name) {
      cleanupLeavingSubtree(child.name);
    }
  }

  delete gameState.freeSprite.nodes[name];
}

export function FreeSpriteActor() {
  const freeSpriteStore = useGameStateStore().freeSprite;
  const freeSpriteState = useGameStateSection('freeSprite');

  // biome-ignore lint/correctness/useExhaustiveDependencies: this must react to snapshot changes while mutating the live store, matching CharacterActor's pattern.
  useLayoutEffect(() => {
    for (const node of Object.values(freeSpriteStore.nodes)) {
      if (node.presence === 'entering' && !node.visible) {
        node.visible = true;
        node.presence = 'present';
      }
    }
  }, [freeSpriteStore, freeSpriteState.nodes]);

  const handleFreeSpriteExited = useCallback(
    (name: string) => {
      const node = freeSpriteStore.nodes[name];
      if (node?.presence === 'leaving' && !node.visible) {
        cleanupLeavingSubtree(name);
      }
    },
    [freeSpriteStore],
  );

  const childMap = buildChildMap(freeSpriteState.nodes as Record<string, FreeSpriteNode>);
  const rootNodes = childMap.get(ROOT_KEY) ?? [];

  const renderNode = (name: string): React.ReactNode => {
    const liveNode = freeSpriteState.nodes[name];
    if (!liveNode) {
      return null;
    }

    const transitionKey = getTransitionKey(liveNode);
    const effect = liveNode.transitionEffect ?? freeSpriteState.defaultTransitionEffect;
    const children = childMap.get(name) ?? [];
    const spriteVisible = liveNode.visible && liveNode.presence === 'present';
    const containerVisible = spriteVisible || liveNode.presence === 'entering' || liveNode.presence === 'leaving';

    return (
      <animated.container
        key={liveNode.name}
        label={`自由精灵容器:${liveNode.name}`}
        x={liveNode.x}
        y={liveNode.y}
        scaleX={liveNode.scaleX}
        scaleY={liveNode.scaleY}
        rotation={liveNode.rotation}
        skewX={liveNode.skewX}
        skewY={liveNode.skewY}
        anchor={liveNode.anchor}
        pivot={liveNode.pivot}
        opacity={liveNode.opacity}
        visible={containerVisible}
        tint={liveNode.tint}
        interactive={liveNode.interactive}
      >
        <Sprite
          label={`自由精灵:${liveNode.name}`}
          src={liveNode.resource.src}
          visible={spriteVisible}
          format={liveNode.resource.kind === 'animation' ? (liveNode.resource.animationFormat ?? 'apng') : undefined}
          isAnimation={liveNode.resource.kind === 'animation'}
          loop={liveNode.resource.kind === 'video'}
          autoPlay={liveNode.resource.kind === 'video'}
          transition={{
            label: `自由精灵转场容器:${liveNode.name}`,
            transitionKey,
            retain: 'static',
            performKey: `${transitionKey}:${liveNode.fadeTime}`,
            effect,
            duration: liveNode.fadeTime,
            onFinished: () => handleFreeSpriteExited(liveNode.name),
          }}
        />
        {children.map((child) => renderNode(child.name))}
      </animated.container>
    );
  };

  return (
    <container label="自由精灵层">
      {rootNodes.map((node) => renderNode(node.name))}
    </container>
  );
}

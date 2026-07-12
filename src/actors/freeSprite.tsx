import { animated, easings, useIsSeeking, useIsSkipping, useSpring } from '@momoyu-ink/kit';
import { useCallback, useLayoutEffect } from 'react';
import { Sprite } from '../components/sprite';
import { type FreeSpriteNode, gameState, useGameStateSection, useGameStateStore } from '../state/game';

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

interface FreeSpriteNodeViewProps {
  name: string;
  fallbackNode: FreeSpriteNode;
  childNames: string[];
  childMap: Map<string, FreeSpriteNode[]>;
  onExited: (name: string) => void;
}

function FreeSpriteNodeView({ name, fallbackNode, childNames, childMap, onExited }: FreeSpriteNodeViewProps) {
  const freeSpriteState = useGameStateSection('freeSprite');
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const liveNode = freeSpriteState.nodes[name];
  const node = liveNode ?? fallbackNode;
  const transitionKey = liveNode === undefined ? EMPTY_SPRITE_KEY : getTransitionKey(liveNode);
  const effect = node.transitionEffect ?? freeSpriteState.defaultTransitionEffect;
  const spriteVisible = liveNode?.visible === true && liveNode.presence === 'present';
  const containerVisible =
    liveNode !== undefined && (spriteVisible || liveNode.presence === 'entering' || liveNode.presence === 'leaving');
  const springs = useSpring({
    x: node.x,
    y: node.y,
    scaleX: node.scaleX,
    scaleY: node.scaleY,
    rotation: node.rotation,
    skewX: node.skewX,
    skewY: node.skewY,
    opacity: node.opacity,
    tint: node.tint ?? '#fff',
    config: {
      duration: shouldSkipVisuals ? 0 : node.fadeTime,
      easing: easings.easeInOutCubic,
    },
  });

  return (
    <animated.container
      label={`自由精灵容器:${node.name}`}
      x={springs.x}
      y={springs.y}
      scaleX={springs.scaleX}
      scaleY={springs.scaleY}
      rotation={springs.rotation}
      skewX={springs.skewX}
      skewY={springs.skewY}
      anchor={node.anchor}
      pivot={node.pivot}
      opacity={springs.opacity}
      visible={containerVisible}
      tint={springs.tint}
      interactive={node.interactive}
    >
      <Sprite
        label={`自由精灵:${node.name}`}
        src={node.resource.src}
        visible={spriteVisible}
        format={node.resource.kind === 'animation' ? (node.resource.animationFormat ?? 'apng') : undefined}
        isAnimation={node.resource.kind === 'animation'}
        loop={node.resource.kind === 'video'}
        autoPlay={node.resource.kind === 'video'}
        transition={{
          label: `自由精灵转场容器:${node.name}`,
          transitionKey,
          retain: 'static',
          performKey: `${transitionKey}:${node.fadeTime}:${shouldSkipVisuals ? 'skip' : 'run'}`,
          effect,
          duration: shouldSkipVisuals ? 0 : node.fadeTime,
          onFinished: () => onExited(node.name),
        }}
      />
      {childNames.map((childName) => (
        <FreeSpriteNodeView
          key={childName}
          name={childName}
          fallbackNode={(childMap.get(name) ?? []).find((child) => child.name === childName) ?? fallbackNode}
          childNames={(childMap.get(childName) ?? []).map((child) => child.name)}
          childMap={childMap}
          onExited={onExited}
        />
      ))}
    </animated.container>
  );
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

  return (
    <container label="自由精灵层">
      {rootNodes.map((node) => (
        <FreeSpriteNodeView
          key={node.name}
          name={node.name}
          fallbackNode={node}
          childNames={(childMap.get(node.name) ?? []).map((child) => child.name)}
          childMap={childMap}
          onExited={handleFreeSpriteExited}
        />
      ))}
    </container>
  );
}

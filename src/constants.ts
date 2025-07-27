import type { MoyuTextAttribute } from '@momoyu-ink/kit';

export const SIDEBAR_WIDTH = 320;
export const SIDEBAR_HEIGHT = 720;
export const CONTENT_WIDTH = 960;
export const CONTENT_HEIGHT = 720;

export const TEXT_COLOR = {
  DEFAULT_IDLE: '#ffffff',
  DEFAULT_HOVER: '#ffffff',
  DEFAULT_PRESS: '#ffffff',
  PRIMARY_IDLE: '#ffffff',
  PRIMARY_HOVER: '#ffffff',
  PRIMARY_PRESS: '#ffffff',
  PRIMARY_TINT: '#ffffff',
};

export const NORMAL_TEXT_STYLE: MoyuTextAttribute = {
  direction: 'horizontal' as const,
  // boxWidth: 200,
  // boxHeight: 36,
  glyphGridSize: 24,

  fontSize: 24,
  lineHeight: 1.5,
  fillColor: 'rgba(255, 255, 255, 1.0)',
  indent: 0,
  // stroke: {},
  // shadow: {},
};

export const SMALL_TEXT_STYLE: MoyuTextAttribute = {
  direction: 'horizontal' as const,
  // boxWidth: 200,
  // boxHeight: 36,
  glyphGridSize: 18,

  fontSize: 18,
  lineHeight: 1.5,
  fillColor: 'rgba(255, 255, 255, 1.0)',
  indent: 0,
  // stroke: {},
  // shadow: {},
};

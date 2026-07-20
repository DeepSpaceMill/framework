import { Slider as KitSlider, type SliderProps as KitSliderProps } from '@momoyu-ink/kit';

export interface SliderProps extends Omit<KitSliderProps, 'thumb' | 'track'> {
  targetWidth?: number;
  targetHeight?: number;
}

const SLIDER_WIDTH = 24;

export function Slider({ targetWidth = 0, targetHeight = 0, ...props }: SliderProps) {
  return (
    <KitSlider
      {...props}
      track={{
        src: ['ui/slider_track.png', 'ui/slider_track_hover.png', 'ui/slider_track_press.png'],
        mode: 'nineslice',
        bounds: [0, 0, 0, 0],
        targetWidth,
        targetHeight,
      }}
      thumb={{
        src: ['ui/slider_handle.png', 'ui/slider_handle_hover.png', 'ui/slider_handle_press.png'],
        mode: 'nineslice',
        bounds: [0.25, 0.25, 0.25, 0.25],
        targetWidth: SLIDER_WIDTH,
        targetHeight,
      }}
    />
  );
}

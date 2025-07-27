import {
  type MoyuNodeAttributes,
  animated,
  useTransition,
} from '@momoyu-ink/kit';
import { TEXT_COLOR } from '../constants';
import { Button } from './button';

export interface DialogProps extends MoyuNodeAttributes {
  content: string;
  mode: 'alert' | 'confirm';
  show: boolean;
  onConfirm?: (yes?: boolean) => void;
}

export function Dialog(props: DialogProps) {
  const { content, mode, show, onConfirm } = props;

  const transitions = useTransition(show ? [0] : [], {
    keys: (item) => item,
    from: {
      opacity: 0,
      scale: 0.3,
    },
    enter: {
      opacity: 1,
      scale: 1,
    },
    leave: {
      opacity: 0,
      scale: 0.8,
    },
    config: {
      mass: 0.5,
      tension: 280,
      friction: 12,
    },
  });

  return transitions((style, _) => (
    <container x={1920 / 2} y={1080 / 2}>
      <sprite
        label="对话框遮罩"
        src="ui/mask.png"
        pivot={[0.5, 0.5]}
        anchor={[0.5, 0.5]}
        opacity={show ? 1 : 0}
      />
      <animated.sprite
        label="对话框"
        src="ui/dialog_bg.png"
        pivot={[0.5, 0.5]}
        anchor={[0.5, 0.5]}
        {...style}
      >
        <text
          label="对话框内容"
          text={content}
          pivot={[0.5, 0]}
          anchor={[0.5, 0]}
          fontSize={36}
          lineHeight={1.5}
          fillColor={TEXT_COLOR.DEFAULT_IDLE}
          x={0}
          y={75}
        />
        {mode === 'alert' && (
          <Button
            fileNames={[
              'ui/dialog_confirm.png',
              'ui/dialog_confirm_hover.png',
              'ui/dialog_confirm_press.png',
            ]}
            label="对话框确认按钮"
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
            x={0}
            y={72}
            tint={TEXT_COLOR.PRIMARY_TINT}
            text="好的"
            color={[
              TEXT_COLOR.PRIMARY_IDLE,
              TEXT_COLOR.PRIMARY_HOVER,
              TEXT_COLOR.PRIMARY_PRESS,
            ]}
            onClick={() => onConfirm?.()}
          />
        )}
        {mode === 'confirm' && (
          <>
            <Button
              fileNames={[
                'ui/dialog_confirm.png',
                'ui/dialog_confirm_hover.png',
                'ui/dialog_confirm_press.png',
              ]}
              label="对话框同意按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={-178}
              y={72}
              tint={TEXT_COLOR.PRIMARY_TINT}
              text="确定"
              color={[
                TEXT_COLOR.PRIMARY_IDLE,
                TEXT_COLOR.PRIMARY_HOVER,
                TEXT_COLOR.PRIMARY_PRESS,
              ]}
              onClick={() => onConfirm?.(true)}
            />
            <Button
              fileNames={[
                'ui/dialog_cancel.png',
                'ui/dialog_cancel_hover.png',
                'ui/dialog_cancel_press.png',
              ]}
              label="对话框拒绝按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={178}
              y={72}
              text="取消"
              color={[
                TEXT_COLOR.DEFAULT_IDLE,
                TEXT_COLOR.DEFAULT_HOVER,
                TEXT_COLOR.DEFAULT_PRESS,
              ]}
              onClick={() => onConfirm?.(false)}
            />
          </>
        )}
      </animated.sprite>
    </container>
  ));
}

import { useState, useRef } from 'react';
import {
  useNavigation,
  useNavigationParams,
  animated,
  getStageSize,
  useTransition,
  useSoundEffect,
} from '@momoyu-ink/kit';
import { Button } from './button';

interface DialogParams {
  message: string;
  mode?: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function Dialog() {
  const params = useNavigationParams<DialogParams>();
  const navigation = useNavigation();
  const answeredRef = useRef(false);

  const content = params?.message ?? '';
  const mode = params?.mode ?? 'confirm';
  const [show, setShow] = useState(true);

  const handleConfirm = (yes: boolean) => {
    answeredRef.current = yes;
    setShow(false);
  };

  const confirmButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.opus');
  const cancelButtonSound = useSoundEffect('audio/error_style_4_001.opus');

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
    onRest: () => {
      if (!show) {
        if (answeredRef.current) {
          params?.onConfirm?.();
        } else {
          params?.onCancel?.();
        }

        navigation.popOverlay();
      }
    },
    config: {
      mass: 0.5,
      tension: 280,
      friction: 12,
    },
  });

  const stageSize = getStageSize();

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 2 }]} opacity={style.opacity}>
      <container x={stageSize.width / 2} y={stageSize.height / 2} scale={stageSize.height / 1080} interactive={show}>
        <animated.sprite label="对话框遮罩" src="ui/mask.png" pivot={[0.5, 0.5]} />
        <animated.sprite label="对话框" src="ui/dialog_bg.png" pivot={[0.5, 0.5]} {...style}>
          <text
            label="对话框内容"
            text={content}
            pivot={[0.5, 0]}
            anchor={[0.5, 0]}
            fontSize={36}
            lineHeight={1.5}
            fillColor="#ffffff"
            x={0}
            y={75}
          />
          {mode === 'alert' && (
            <Button
              fileNames={['ui/dialog_confirm.png', 'ui/dialog_confirm_hover.png', 'ui/dialog_confirm_press.png']}
              label="对话框确认按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={0}
              y={72}
              tint="#ffffff"
              text="好的"
              color="#ffffff"
              onClick={() => {
                confirmButtonSound();
                handleConfirm(true);
              }}
            />
          )}
          {mode === 'confirm' && (
            <>
              <Button
                fileNames={['ui/dialog_confirm.png', 'ui/dialog_confirm_hover.png', 'ui/dialog_confirm_press.png']}
                label="对话框同意按钮"
                pivot={[0.5, 0.5]}
                anchor={[0.5, 0.5]}
                x={-178}
                y={72}
                tint="#ffffff"
                text="确定"
                color="#ffffff"
                onClick={() => {
                  confirmButtonSound();
                  handleConfirm(true);
                }}
              />
              <Button
                fileNames={['ui/dialog_cancel.png', 'ui/dialog_cancel_hover.png', 'ui/dialog_cancel_press.png']}
                label="对话框拒绝按钮"
                pivot={[0.5, 0.5]}
                anchor={[0.5, 0.5]}
                x={178}
                y={72}
                text="取消"
                color="#ffffff"
                onClick={() => {
                  cancelButtonSound();
                  handleConfirm(false);
                }}
              />
            </>
          )}
        </animated.sprite>
      </container>
    </animated.backdrop>
  ));
}

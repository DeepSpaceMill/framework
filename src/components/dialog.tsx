import { useState, useRef } from 'react';
import {
  useNavigation,
  useNavigationParams,
  animated,
  getStageSize,
  useTransition,
  useSoundEffect,
  useUiData,
} from '@momoyu-ink/kit';
import { Button } from './button';

interface DialogParams {
  message?: string;
  mode?: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function Dialog() {
  const params = useNavigationParams<DialogParams>();
  const navigation = useNavigation();
  const confirmUi = useUiData('confirm');
  const answeredRef = useRef(false);

  const content = params?.message ?? confirmUi.defaultMessage;
  const mode = params?.mode ?? confirmUi.defaultMode;
  const [show, setShow] = useState(true);

  const handleConfirm = (yes: boolean) => {
    answeredRef.current = yes;
    setShow(false);
  };

  const confirmButtonSound = useSoundEffect(confirmUi.confirmButtonSound);
  const cancelButtonSound = useSoundEffect(confirmUi.cancelButtonSound);

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
        <animated.sprite label="对话框遮罩" src={confirmUi.mask} pivot={[0.5, 0.5]} anchor={[0.5, 0.5]} />
        <animated.sprite label="对话框" src={confirmUi.background} pivot={[0.5, 0.5]} anchor={[0.5, 0.5]} {...style}>
          <text
            label="对话框内容"
            text={content}
            pivot={[0.5, 0]}
            anchor={[0.5, 0]}
            fontSize={confirmUi.message.fontSize}
            lineHeight={1.5}
            fillColor={confirmUi.message.color}
            x={confirmUi.message.position.x}
            y={confirmUi.message.position.y}
          />
          {mode === 'alert' && (
            <Button
              fileNames={confirmUi.alertButton.fileNames}
              label="对话框确认按钮"
              pivot={[0.5, 0.5]}
              anchor={[0.5, 0.5]}
              x={confirmUi.alertButton.position.x}
              y={confirmUi.alertButton.position.y}
              tint="#ffffff"
              text={confirmUi.alertButton.text}
              color={confirmUi.alertButton.color}
              fontSize={confirmUi.alertButton.fontSize}
              onClick={() => {
                confirmButtonSound();
                handleConfirm(true);
              }}
            />
          )}
          {mode === 'confirm' && (
            <>
              <Button
                fileNames={confirmUi.confirmButton.fileNames}
                label="对话框同意按钮"
                pivot={[0.5, 0.5]}
                anchor={[0.5, 0.5]}
                x={confirmUi.confirmButton.position.x}
                y={confirmUi.confirmButton.position.y}
                tint="#ffffff"
                text={confirmUi.confirmButton.text}
                color={confirmUi.confirmButton.color}
                fontSize={confirmUi.confirmButton.fontSize}
                onClick={() => {
                  confirmButtonSound();
                  handleConfirm(true);
                }}
              />
              <Button
                fileNames={confirmUi.cancelButton.fileNames}
                label="对话框拒绝按钮"
                pivot={[0.5, 0.5]}
                anchor={[0.5, 0.5]}
                x={confirmUi.cancelButton.position.x}
                y={confirmUi.cancelButton.position.y}
                text={confirmUi.cancelButton.text}
                color={confirmUi.cancelButton.color}
                fontSize={confirmUi.cancelButton.fontSize}
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

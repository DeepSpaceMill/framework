import React from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback(props: FallbackProps) {
  const error = props.error as Error;

  return (
    <container cursor="default">
      <text label="title" text={error.name} fontSize={64} lineHeight={1} fillColor="#FF616E" x={80} y={60} />
      <text label="message" text={error.message} fontSize={48} lineHeight={1} fillColor="#666" x={85} y={156} />
      <text
        label="stack"
        text={error.stack?.replace(/\//g, '\\/')}
        fontSize={36}
        lineHeight={1.5}
        boxWidth={1700}
        fillColor="#666"
        x={90}
        y={240}
      />
      <text
        label="btn"
        text={'ignore'}
        fontSize={48}
        lineHeight={1.5}
        fillColor="#666"
        x={1660}
        y={76}
        cursor="pointer"
        onClick={() => {
          props.resetErrorBoundary();
        }}
      />
    </container>
  );
}

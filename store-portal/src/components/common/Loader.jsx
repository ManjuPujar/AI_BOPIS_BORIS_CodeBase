import React from 'react';

const spinKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

export default function Loader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 200,
      }}
    >
      <style>{spinKeyframes}</style>
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.06)',
          borderTopColor: '#c8102e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}

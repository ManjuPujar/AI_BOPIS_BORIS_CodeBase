import React from 'react';
import { getStatusLabel } from '../../utils/statusLabels';

export default function Badge({ status }) {
  const { label, color } = getStatusLabel(status);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

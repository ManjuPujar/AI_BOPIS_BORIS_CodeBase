const STATUS_MAP = {
  AWAITING_STORE_ACCEPTANCE: { label: 'Awaiting Acceptance', color: '#f59e0b' },
  ACCEPTED: { label: 'Accepted', color: '#3b82f6' },
  PICKING: { label: 'Picking', color: '#8b5cf6' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: '#10b981' },
  OTP_VERIFIED: { label: 'OTP Verified', color: '#7c3aed' },
  PICKED_UP: { label: 'Picked Up', color: '#059669' },
  COMPLETED: { label: 'Completed', color: '#6b7280' },
  REJECTED: { label: 'Rejected', color: '#dc2626' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444' },
  DECLINED: { label: 'Declined', color: '#dc2626' },

  RETURN_REQUESTED: { label: 'Return Requested', color: '#f59e0b' },
  RETURN_ACCEPTED: { label: 'Return Accepted', color: '#3b82f6' },
  RETURN_IN_PROGRESS: { label: 'Return In Progress', color: '#8b5cf6' },
  RETURN_VERIFICATION_PENDING: { label: 'Verification Pending', color: '#8b5cf6' },
  RETURN_VERIFIED_PASS: { label: 'Verified — Pass', color: '#10b981' },
  RETURN_VERIFIED_FAIL: { label: 'Verified — Fail', color: '#ef4444' },
  RETURN_COMPLETED: { label: 'Return Completed', color: '#10b981' },
  RETURN_REJECTED: { label: 'Return Rejected', color: '#ef4444' },
  RETURN_CANCELLED: { label: 'Return Cancelled', color: '#6b7280' },

  PENDING: { label: 'Pending', color: '#f59e0b' },
  PROCESSING: { label: 'Processing', color: '#3b82f6' },
  SHIPPED: { label: 'Shipped', color: '#8b5cf6' },
  DELIVERED: { label: 'Delivered', color: '#10b981' },
};

export function getStatusLabel(status) {
  return STATUS_MAP[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', color: '#9ca3af' };
}

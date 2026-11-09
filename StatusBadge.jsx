/* StatusBadge – soft tinted pill for a status (store, product, order, stock): { label, tone ('neutral'|'primary'|'success'|'warning'|'error'|'info', default 'neutral'), dot (small coloured dot, default true) } */
function StatusBadge({ label, tone = 'neutral', dot = true }) {
  const tones = {
    neutral: 'bg-surface-2 text-text-secondary',
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success-text',
    warning: 'bg-warning-light text-warning-text',
    error: 'bg-error-light text-error-text',
    info: 'bg-info-light text-info-text',
  };
  if (!label) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`}>
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}

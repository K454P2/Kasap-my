/* ProductCard – one product in a catalog grid: { image, name, priceText (already formatted), storeName, city, rating (number, optional), badge (short text, optional), badgeTone ('warning'|'error'|'success'|'info', default 'warning'), verifiedLabel (text of the verified seal on the store name, optional), actionLabel (button text, optional), onAction, onClick, disabled } */
function ProductCard({ image, name, priceText, storeName, city, rating, badge, badgeTone = 'warning', verifiedLabel, actionLabel, onAction, onClick, disabled = false }) {
  const tones = { warning: 'bg-warning-light text-warning-text', error: 'bg-error-light text-error-text', success: 'bg-success-light text-success-text', info: 'bg-info-light text-info-text' };
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card-bg transition duration-200 hover:-translate-y-1 hover:border-primary">
      <button type="button" onClick={onClick} className="relative block aspect-square w-full overflow-hidden bg-surface-2 text-start focus-visible:outline-2">
        {image ? <img src={image} alt={name || ''} loading="lazy" className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${disabled ? 'opacity-60 grayscale' : ''}`} /> : <span className="flex h-full w-full items-center justify-center text-text-muted"><ImageOff size={32} /></span>}
        {badge ? <span className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${tones[badgeTone] || tones.warning}`}>{badge}</span> : null}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{name}</h3>
        <p className="text-lg font-extrabold tracking-tight text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>{priceText}</p>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="truncate font-semibold text-text">{storeName}</span>
          {verifiedLabel ? <span title={verifiedLabel} className="inline-flex shrink-0 items-center text-primary"><BadgeCheck size={14} /><span className="sr-only">{verifiedLabel}</span></span> : null}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <span className="flex min-w-0 items-center gap-1"><MapPin size={12} className="shrink-0" /><span className="truncate">{city}</span></span>
          {rating ? <span className="flex items-center gap-1 font-semibold text-text-secondary"><Star size={12} className="fill-warning text-warning" />{Number(rating).toFixed(1)}</span> : null}
        </div>
        {actionLabel ? <button type="button" onClick={onAction} disabled={disabled} className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-btn-primary-bg px-4 py-2 text-sm font-semibold text-btn-primary-text transition hover:bg-btn-primary-hover disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle size={15} />{actionLabel}</button> : null}
      </div>
    </article>
  );
}

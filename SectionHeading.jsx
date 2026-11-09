/* SectionHeading – heading block of a page section: { eyebrow (small uppercase text, optional), title, subtitle (optional), align ('start'|'center', default 'start'), inverse (true on dark bands, default false), action (optional React node shown at the end, e.g. a link or button) } */
function SectionHeading({ eyebrow, title, subtitle, align = 'start', inverse = false, action = null }) {
  const center = align === 'center';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className={`mb-8 flex flex-wrap items-end gap-4 ${center ? 'justify-center text-center' : 'justify-between text-start'}`}
    >
      <div className={`max-w-2xl ${center ? 'mx-auto' : ''}`}>
        {eyebrow ? (
          <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary ${center ? 'justify-center' : ''}`}>
            <span className="h-0.5 w-6 rounded-full bg-primary" />{eyebrow}
          </p>
        ) : null}
        <h2 className={`text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl ${inverse ? 'text-text-inverse' : 'text-text'}`}>{title}</h2>
        {subtitle ? <p className={`mt-2 text-base leading-relaxed ${inverse ? 'text-text-muted' : 'text-text-secondary'}`}>{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}

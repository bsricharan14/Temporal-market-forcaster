export default function Panel({ title, subtitle, right, children, className = "" }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || subtitle || right) && (
        <header className="panel-header">
          <div>
            {title ? <h2 className="panel-title">{title}</h2> : null}
            {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}
          </div>
          {right ? <div>{right}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

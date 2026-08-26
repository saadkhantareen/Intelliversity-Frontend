const TermFormSection = ({ title, description, children, isFirst = false }) => {
  return (
    <section className={isFirst ? 'pb-7' : 'border-t border-slate-200 py-7'} aria-label={title}>
      <header className="mb-5">
        <h2 className="m-0 text-base font-bold text-slate-800">{title}</h2>
        {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
      </header>
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
};

export default TermFormSection;

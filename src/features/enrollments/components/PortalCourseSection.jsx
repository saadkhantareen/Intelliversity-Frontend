const PortalCourseSection = ({ title, description, children }) => {
  return (
    <section
      aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}
    >
      <header className="mb-4">
        <h2
          id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </header>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {children}
      </div>
    </section>
  );
};

export default PortalCourseSection;

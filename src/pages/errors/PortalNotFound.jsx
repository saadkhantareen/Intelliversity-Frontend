function PortalNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <p className="text-sm font-semibold tracking-wide text-red-600 uppercase">
          Portal unavailable
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Portal Not Found
        </h1>
        <p className="mt-4 text-gray-600">
          We could not find a valid university portal for this domain. Please
          verify the portal URL or contact your administrator.
        </p>
      </section>
    </main>
  );
}

export default PortalNotFound;

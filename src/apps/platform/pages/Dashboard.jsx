/**
 * Platform Dashboard — Super Admin sees all registered universities here.
 * Can create new tenants, view stats, manage subscriptions.
 */

export default function PlatformDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Intelliversity Platform</h1>
      <p className="text-gray-500 mt-2">
        Super Admin Portal — Manage all universities
      </p>
      <p className="mt-4">
        Build your platform UI here: create universities, view stats...
      </p>
    </div>
  );
}

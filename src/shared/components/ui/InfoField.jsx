function InfoField({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{value || '—'}</p>
    </div>
  );
}

export default InfoField;

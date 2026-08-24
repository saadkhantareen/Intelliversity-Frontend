import React from 'react';

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {title && <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

export default SectionCard;

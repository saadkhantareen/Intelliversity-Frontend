import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BatchService from '../../services/batch.service';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    BatchService.getBatches().then(setBatches).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batches</h1>
        <button
          onClick={() => navigate('/academics/batches/create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Create Batch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4">Curriculum</th>
              <th className="px-6 py-4">Sections</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{b.name}</td>
                <td className="px-6 py-4 text-indigo-600 font-medium">{b.program}</td>
                <td className="px-6 py-4 text-gray-600">{b.curriculum}</td>
                <td className="px-6 py-4 italic">{b.sections?.length || 0} sections</td>
                <td className="px-6 py-4">
                  {b.is_active ? (
                    <span className="text-green-600 text-xs font-bold">ACTIVE</span>
                  ) : (
                    <span className="text-gray-400 text-xs font-bold">INACTIVE</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/academics/batches/edit/${b.id}`)}
                    className="text-blue-600 font-bold mr-4"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchList;

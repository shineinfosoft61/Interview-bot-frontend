import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiFile } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getRequirement, updateRequirement } from '../reduxServices/actions/InterviewAction';
import EditRequirementPopup from '../Modal/EditRequirementPopup';
import { toast } from 'react-toastify';

const JobDescriptions = () => {
  const dispatch = useDispatch();
  const requirements = useSelector((state) => state.InterviewReducer.requirement || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRequirement, setEditingRequirement] = useState(null);
  // inline editing state: which cell is being edited and draft value
  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: '', saving: false });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        await dispatch(getRequirement());
      } catch (err) {
        setError('Failed to fetch requirements');
        console.error('Error fetching requirements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequirements();
  }, [dispatch]);

  const startEdit = (req, field) => {
    if (!req || !field) return;
    setEditingCell({ id: req.id, field, value: req[field] ?? '', saving: false });
  };

  const cancelEdit = () => {
    setEditingCell({ id: null, field: null, value: '', saving: false });
  };

  const commitEdit = async () => {
    const { id, field, value } = editingCell;
    if (!id || !field) return cancelEdit();
    setEditingCell((s) => ({ ...s, saving: true }));
    try {
      const payload = { [field]: value };
      const result = await dispatch(updateRequirement(id, payload));
      if (result?.success) {
        toast.success('Updated');
        await dispatch(getRequirement());
        cancelEdit();
      } else {
        toast.error(result?.error || 'Failed to update');
        setEditingCell((s) => ({ ...s, saving: false }));
      }
    } catch (e) {
      toast.error('Update failed');
      setEditingCell((s) => ({ ...s, saving: false }));
    }
  };

  const onCellKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const togglePriority = async (req) => {
    if (!req?.id) return;
    try {
      const result = await dispatch(updateRequirement(req.id, { priority: !req.priority }));
      if (result?.success) {
        await dispatch(getRequirement());
      } else {
        toast.error(result?.error || 'Failed to update priority');
      }
    } catch (e) {
      toast.error('Failed to update priority');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Job Descriptions</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, tech, experience"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <button
              onClick={() => navigate('/requirements')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiFile className="mr-2" />
              Requirement
            </button>
          </div>
        </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading requirements...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No requirements found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technology</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Openings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(requirements
                  .filter((req) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    const fields = [
                      req.name,
                      req.technology,
                      req.experience,
                      req.No_of_openings,
                      req.notice_period,
                      req.priority ? 'high' : 'normal',
                    ].map(v => (v ?? '').toString().toLowerCase());
                    return fields.some(f => f.includes(q));
                  })
                ).length > 0 ? (
                  (requirements
                    .filter((req) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      const fields = [
                        req.name,
                        req.technology,
                        req.experience,
                        req.No_of_openings,
                        req.notice_period,
                        req.priority ? 'high' : 'normal',
                      ].map(v => (v ?? '').toString().toLowerCase());
                      return fields.some(f => f.includes(q));
                    })
                  ).map((req, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {/* Name (click to edit) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingCell.id === req.id && editingCell.field === 'name' ? (
                          <input
                            autoFocus
                            type="text"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCell.value}
                            disabled={editingCell.saving}
                            onChange={(e) => setEditingCell((s) => ({ ...s, value: e.target.value }))}
                            onBlur={commitEdit}
                            onKeyDown={onCellKeyDown}
                          />
                        ) : (
                          <button
                            type="button"
                            className="text-left w-full hover:underline"
                            title="Click to edit"
                            onClick={() => startEdit(req, 'name')}
                          >
                            {req.name || 'N/A'}
                          </button>
                        )}
                      </td>
                      {/* Experience */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingCell.id === req.id && editingCell.field === 'experience' ? (
                          <input
                            autoFocus
                            type="text"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCell.value}
                            disabled={editingCell.saving}
                            onChange={(e) => setEditingCell((s) => ({ ...s, value: e.target.value }))}
                            onBlur={commitEdit}
                            onKeyDown={onCellKeyDown}
                          />
                        ) : (
                          <button
                            type="button"
                            className="text-left w-full hover:underline text-gray-600"
                            title="Click to edit"
                            onClick={() => startEdit(req, 'experience')}
                          >
                            {req.experience || 'None'}
                          </button>
                        )}
                      </td>
                      {/* Technology */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingCell.id === req.id && editingCell.field === 'technology' ? (
                          <input
                            autoFocus
                            type="text"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCell.value}
                            disabled={editingCell.saving}
                            onChange={(e) => setEditingCell((s) => ({ ...s, value: e.target.value }))}
                            onBlur={commitEdit}
                            onKeyDown={onCellKeyDown}
                          />
                        ) : (
                          <button
                            type="button"
                            className="text-left w-full hover:underline text-gray-600"
                            title="Click to edit"
                            onClick={() => startEdit(req, 'technology')}
                          >
                            {req.technology || 'None'}
                          </button>
                        )}
                      </td>
                      {/* Openings (number) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {editingCell.id === req.id && editingCell.field === 'No_of_openings' ? (
                          <input
                            autoFocus
                            type="number"
                            min="1"
                            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            value={editingCell.value}
                            disabled={editingCell.saving}
                            onChange={(e) => setEditingCell((s) => ({ ...s, value: e.target.value }))}
                            onBlur={commitEdit}
                            onKeyDown={onCellKeyDown}
                          />
                        ) : (
                          <button
                            type="button"
                            className="w-full hover:underline text-gray-600"
                            title="Click to edit"
                            onClick={() => startEdit(req, 'No_of_openings')}
                          >
                            {req.No_of_openings || 'None'}
                          </button>
                        )}
                      </td>
                      {/* Notice period (number days) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingCell.id === req.id && editingCell.field === 'notice_period' ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            className="w-28 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCell.value}
                            disabled={editingCell.saving}
                            onChange={(e) => setEditingCell((s) => ({ ...s, value: e.target.value }))}
                            onBlur={commitEdit}
                            onKeyDown={onCellKeyDown}
                          />
                        ) : (
                          <button
                            type="button"
                            className="text-left w-full hover:underline text-gray-600"
                            title="Click to edit"
                            onClick={() => startEdit(req, 'notice_period')}
                          >
                            {req.notice_period ? `${req.notice_period} days` : 'None'}
                          </button>
                        )}
                      </td>
                      {/* Priority toggle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => togglePriority(req)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${req.priority ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                          title="Toggle priority"
                        >
                          {req.priority ? 'High' : 'Normal'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.created_at ? format(new Date(req.created_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingRequirement(req)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Edit"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No requirements found.
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>
              </div>
          )}
      </div>
      
      {/* Edit Requirement Popup */}
      {editingRequirement && (
        <EditRequirementPopup
          requirement={editingRequirement}
          onClose={() => setEditingRequirement(null)}
          onUpdate={(updatedRequirement) => {
            // You might want to update the local state or refetch requirements
            dispatch(getRequirement());
          }}
        />
      )}
    </div>
  );
};

export default JobDescriptions;

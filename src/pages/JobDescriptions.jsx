import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiFile } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getRequirement } from '../reduxServices/actions/InterviewAction';
import EditRequirementPopup from '../Modal/EditRequirementPopup';

const JobDescriptions = () => {
  const dispatch = useDispatch();
  const requirements = useSelector((state) => state.InterviewReducer.requirement || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRequirement, setEditingRequirement] = useState(null);
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

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
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
          <button
            onClick={() => navigate('/requirements')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiFile className="mr-2" />
            Requirement
          </button>
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
                {requirements.length > 0 ? (
                  requirements.map((req, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {req.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.experience || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.technology || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {req.No_of_openings || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.notice_period ? `${req.notice_period} days` : 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.priority ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {req.priority ? 'High' : 'Normal'}
                        </span>
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

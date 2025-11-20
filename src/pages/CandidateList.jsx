import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiFilter, FiClock, FiCheckCircle, FiXCircle, FiEdit2, FiPlus } from 'react-icons/fi';
import HrDocPopup from '../Modal/HrDocPopup';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHrDocument, getRequirement, updateHRDocument } from '../reduxServices/actions/InterviewAction';
import QuestionUploadPopup from '../Modal/QuestionUploadPopup';

const CandidateList = () => {
  const dispatch = useDispatch();
  const hrDocument = useSelector((state) => state.InterviewReducer.hrDocument || []);
  console.log('hrDocument------------', hrDocument);
  const requirements = useSelector((state) => state.InterviewReducer.requirement || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHrDoc, setEditHrDoc] = useState(null);
  const [candidateRequirements, setCandidateRequirements] = useState({});
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const navigate = useNavigate();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditHrDoc(null);
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        await dispatch(getHrDocument());
      } catch (err) {
        setError('Failed to fetch candidates');
        console.error('Error fetching candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCandidates();
  }, [dispatch]);

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

  const handleRequirementChange = async (candidateId, requirementId) => {
    try {
      // Prepare the payload with the new requirement_id
      const payload = {
        requirement: requirementId
      };
      
      // Call the API to update the HR document
      const res = await dispatch(updateHRDocument(candidateId, payload));
      dispatch(getHrDocument());
      dispatch(getRequirement());
      if (!res.success) {
        setError('Failed to update requirement');
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      setError('An error occurred while updating the requirement');
      
    }
  };

  const filteredCandidates = hrDocument
    .filter(candidate => {
      if (statusFilter === 'All') return true;
      return candidate.interview_status === statusFilter;
    })
    .filter(candidate => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fields = [
        candidate.name,
        candidate.email,
        candidate.technology,
        candidate.phone,
      ].map(v => (v || '').toString().toLowerCase());
      return fields.some(f => f.includes(q));
    });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1" /> Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiXCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-3">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone"
                className="bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                <FiFilter />
              </span>
            </div>
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No candidates found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technology
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requirement
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.map((candidate, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {candidate.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.technology || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(candidate.interview_status || 'Pending')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={candidate.requirement || ''}
                        onChange={(e) => handleRequirementChange(candidate.id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">None</option>
                        {requirements.map((req) => (
                          <option key={req.id} value={req.id}>
                            {req.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditHrDoc(candidate);
                          setShowUploadPopup(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiPlus className="mr-1 h-3 w-3" />
                        Add Questions
                      </button>
                      <button
                        onClick={() => {
                          setEditHrDoc(candidate);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit Candidate"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <HrDocPopup
          editHrDoc={editHrDoc}
          closeModal={closeModal}
          setEditHrDoc={setEditHrDoc}
        />
      )}

      <QuestionUploadPopup
        editHrDoc={editHrDoc}
        setEditHrDoc={setEditHrDoc}
        isOpen={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        onUpload={(file) => {
          console.log('Uploading file for candidate:', editHrDoc?.id, file);
          // Add your file upload logic here
        }}
      />
    </div>
  );
};

export default CandidateList;

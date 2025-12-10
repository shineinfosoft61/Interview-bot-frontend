import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiFilter, FiClock, FiCheckCircle, FiXCircle, FiEdit2, FiPlus, FiFile, FiHelpCircle, FiLoader } from 'react-icons/fi';
import { FileText, X } from 'lucide-react';
import HrDocPopup from '../Modal/HrDocPopup';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHrDocument, getRequirement, updateHRDocument, saveHRDocument, getEnums } from '../reduxServices/actions/InterviewAction';
import Resume from '../components/Resume';
import CustomDropdown from '../components/CustomDropdown';
import QuestionManagementPopup from '../Modal/QuestionManagementPopup';
import AnswerReportModal from '../Modal/AnswerReportModal';
import DecisionConfirmPopup from '../Modal/DecisionConfirmPopup';
import { toast } from 'react-toastify';


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
  const [reportInterview, setReportInterview] = useState(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: '', saving: false });
  const navigate = useNavigate();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditHrDoc(null);
  };

  const closeReport = () => {
    setReportInterview(null);
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

  useEffect(() => {
    const fetchTechnologyOptions = async () => {
      try {
        const enumsResult = await dispatch(getEnums());
        if (enumsResult?.success && enumsResult.data?.technologies) {
          setTechnologyOptions(enumsResult.data.technologies);
        }
      } catch (err) {
        console.error('Error fetching technology options:', err);
      }
    };
    
    fetchTechnologyOptions();
  }, [dispatch]);

  const startEdit = (candidate, field) => {
    if (!candidate || !field) return;
    let value = candidate[field] ?? '';
    
    // For technology field, convert to proper format
    if (field === 'technology') {
      if (Array.isArray(candidate.technology)) {
        value = candidate.technology.map(t => 
          typeof t === 'string' 
            ? technologyOptions.find(opt => opt.value === t) || { value: t, label: t }
            : t
        );
      } else if (candidate.technology) {
        value = [typeof candidate.technology === 'string' 
          ? technologyOptions.find(opt => opt.value === candidate.technology) || { value: candidate.technology, label: candidate.technology }
          : candidate.technology
        ];
      } else {
        value = [];
      }
    }
    
    setEditingCell({ id: candidate.id, field, value, saving: false });
  };

  const cancelEdit = () => {
    setEditingCell({ id: null, field: null, value: '', saving: false });
  };

  const saveEdit = async () => {
    if (!editingCell.id) return;
    
    setEditingCell(prev => ({ ...prev, saving: true }));
    
    try {
      let payload;
      if (editingCell.field === 'technology') {
        // For technology, send array of values
        payload = {
          technology: editingCell.value.map(t => t.value)
        };
      } else {
        // For other fields, send the value directly
        payload = {
          [editingCell.field]: editingCell.value
        };
      }
      
      const result = await dispatch(updateHRDocument(editingCell.id, payload));
      
      if (result?.success) {
        toast.success('Candidate updated successfully');
        // Refresh candidates
        await dispatch(getHrDocument());
      } else {
        toast.error(result?.error || 'Failed to update candidate');
      }
    } catch (err) {
      toast.error('Failed to update candidate');
      console.error('Error updating candidate:', err);
    } finally {
      cancelEdit();
    }
  };

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
        candidate.interview_status,
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
    <div className="min-h-screen ml-60 p-4 bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, technology, phone"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <button
              onClick={() => setShowResumePopup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiFile className="mr-2" />
              ADD CANDIDATE
            </button>
            
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technology
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requirement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass/Fail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 border-l border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {candidate.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '25%' }}>
                      <div className="relative" style={{ minWidth: '200px' }}>
                        <CustomDropdown
                          options={technologyOptions}
                          value={
                            // Handle different data formats for technology field
                            (() => {
                              if (!candidate.technology) return [];
                              
                              // If it's already an array, use it
                              if (Array.isArray(candidate.technology)) {
                                return candidate.technology.map(t => 
                                  typeof t === 'string' 
                                    ? technologyOptions.find(opt => opt.value === t) || { value: t, label: t }
                                    : t
                                );
                              }
                              
                              // If it's a comma-separated string, split it
                              if (typeof candidate.technology === 'string') {
                                const techArray = candidate.technology.split(',').map(t => t.trim()).filter(Boolean);
                                return techArray.map(t => 
                                  technologyOptions.find(opt => opt.value === t) || { value: t, label: t }
                                );
                              }
                              
                              // If it's a single string (not array), wrap it
                              if (typeof candidate.technology === 'string') {
                                return [technologyOptions.find(opt => opt.value === candidate.technology) || { value: candidate.technology, label: candidate.technology }];
                              }
                              
                              // Fallback
                              return [];
                            })()
                          }
                          onChange={async (selected) => {
                            // Update immediately
                            const payload = {
                              technology: selected.map(t => t.value).join(',')
                            };
                            
                            // Show saving state
                            setEditingCell({ id: candidate.id, field: 'technology', value: selected, saving: true });
                            
                            try {
                              const result = await dispatch(updateHRDocument(candidate.id, payload));
                              if (result?.success) {
                                toast.success('Technology updated successfully');
                                await dispatch(getHrDocument());
                              } else {
                                toast.error(result?.error || 'Failed to update technology');
                              }
                            } catch (err) {
                              toast.error('Failed to update technology');
                              console.error('Error updating technology:', err);
                            } finally {
                              setEditingCell({ id: null, field: null, value: '', saving: false });
                            }
                          }}
                          multiSelect={true}
                          searchable={true}
                          placeholder="Select technologies..."
                          className="w-full"
                        />
                        {editingCell.saving && editingCell.id === candidate.id && (
                          <FiLoader className="absolute right-2 top-3 w-4 h-4 text-blue-500 animate-spin" />
                        )}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {candidate.interview_status === "Completed" ? (
                        <button
                          type="button"
                          onClick={() => setReportInterview(candidate)}
                          className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No report available</span>
                      )}
                    </td>
                    {candidate?.is_selected === null ? (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setConfirmCandidate(candidate)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Confirm Decision
                      </button>
                    </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm ${
                          candidate.is_selected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {candidate.is_selected ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-10 border-l border-gray-200">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <button
                          onClick={() => {
                            setEditHrDoc(candidate);
                            setIsModalOpen(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            candidate.interview_status === "Completed" 
                              ? "text-blue-600 hover:bg-blue-50" 
                              : "text-blue-600 hover:text-blue-900"
                          }`}
                          title="Edit Candidate"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditHrDoc(candidate);
                            setShowUploadPopup(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            candidate.interview_status === "Completed"
                              ? "text-gray-400 hover:text-gray-600"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                          title={candidate.interview_status === "Completed" ? "View Questions" : "Manage Questions"}
                        >
                          <FiHelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No candidates found.
                    </td>
                  </tr>
                )}
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

      <QuestionManagementPopup
        editHrDoc={editHrDoc}
        isOpen={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        isCompleted={editHrDoc?.interview_status === "Completed"}
      />

      <DecisionConfirmPopup
        isOpen={!!confirmCandidate}
        candidate={confirmCandidate}
        onClose={() => setConfirmCandidate(null)}
      />

      {showResumePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Add New Candidate</h2>
              </div>
              <button
                onClick={() => setShowResumePopup(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <Resume 
                onSuccess={() => {
                  setShowResumePopup(false);
                  dispatch(getHrDocument()); // Refresh the candidate list
                }} 
                onClose={() => setShowResumePopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {reportInterview && (
        <AnswerReportModal
          interview={reportInterview}
          onClose={closeReport}
        />
      )}
    </div>
  );
};

export default CandidateList;

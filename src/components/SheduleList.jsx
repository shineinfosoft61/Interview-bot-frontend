import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, Briefcase, Clock, ArrowLeft, AlertCircle, Filter, Pencil, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHrDocument, updateHRDocument } from '../reduxServices/actions/InterviewAction';
import { API_URL } from '../reduxServices/api/InterviewApi';
import { toast } from 'react-toastify';
import HrDocPopup from '../Modal/HrDocPopup';
import AnswerReportModal from '../Modal/AnswerReportModal';

const SheduleList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [editHrDoc, setEditHrDoc] = useState(null);
  const [reportInterview, setReportInterview] = useState(null);

  const hrDocument = useSelector((state) => state.InterviewReducer.hrDocument || []);
  console.log('-------------------------',hrDocument);

  useEffect(() => {
    dispatch(getHrDocument());
  }, [dispatch]);
  

  const filteredInterviews = Array.isArray(hrDocument)
  ? hrDocument.filter((interview) => {
      if (!statusFilter || statusFilter === "All") return true;
      return interview?.interview_status === statusFilter;
    })
  : [];

  // Modal state for editing
  const closeModal = () => {
    setIsModalOpen(false);
    setEditHrDoc(null);
  };

  const closeReport = () => {
    setReportInterview(null);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/hr-control')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{statusFilter}</h1>
                <p className="text-gray-600">View and manage all scheduled interviews</p>
              </div>
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Filter</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-gray-100 cursor-pointer"
                >
                  <option>All</option>
                  <option>Scheduled</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
                <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.958a.75.75 0 111.08 1.04l-4.24 4.525a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Interviews List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No interviews found</p>
              <p className="text-sm text-gray-400 mt-2">
                Try a different status filter or schedule your first interview from the HR Control panel
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {interview.photo ? (
                          <img
                            src={`${API_URL}${interview.photo}`}
                            alt={interview.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold">
                            {(interview.name || '?')
                              .split(' ')
                              .map(n => n[0])
                              .slice(0,2)
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {interview.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full
                            ${
                              interview.interview_status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : interview.interview_status === "Complated"
                                ? "bg-green-100 text-green-700"
                                : interview.interview_status === "Scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {interview.interview_status}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditHrDoc(interview); setIsModalOpen(true); }}
                          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{interview.email}</span>
                      </div>
                      {interview.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{interview.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                        {interview.time
                          ? new Date(interview.time).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : "Pending"}
                      </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{interview.technology} • {interview.experience}</span>
                      </div>
                      {/* Report Button */}
                      {interview.interview_status === "Completed" && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setReportInterview(interview)}
                          className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </button>
                      </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <HrDocPopup
            editHrDoc = {editHrDoc}
            closeModal={closeModal}
            setEditHrDoc={setEditHrDoc}
          />

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

export default SheduleList;
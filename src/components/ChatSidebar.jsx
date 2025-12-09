import React, { useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import { X, MessageSquare, Sparkles, Send, Save, Copy, Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';


const ChatSidebar = ({ open, onClose }) => {
  const textareaRef = useRef(null);
  
  // State variables
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentFields, setCurrentFields] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [generatedJD, setGeneratedJD] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | awaiting_analysis | awaiting_generation | editing_jd
  const [isLoading, setIsLoading] = useState(false);
  const [isJDActionLoading, setIsJDActionLoading] = useState(false);
  const [activeJDAction, setActiveJDAction] = useState(null); // 'save' | 'copy' | 'docx' | 'pdf' | null
  const [originalMessage, setOriginalMessage] = useState(''); // Store original user message

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage('');
    setOriginalMessage(userMessage); // Store original message
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setStatus('awaiting_analysis');
    setIsLoading(true);

    try {
      // Call analyze API
      const response = await axiosInstance.post('/jd-assistant/analyze/', { message: userMessage });
      const data = response.data;
      
      if (data.status === 'need_more_info') {
        setMessages(prev => [...prev, { role: 'assistant', text: data.message }]);
        setMissingFields(data.missing_fields || []);
        setCurrentFields(data.fields || {});
        setStatus('editing_jd');
      } else if (data.status === 'ready') {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Generating your job description...' }]);
        await generateJD(userMessage, data);
      }
    } catch (error) {
      toast.error('Failed to analyze request. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate JD
  const generateJD = async (originalMessage, analysisData) => {
    setStatus('awaiting_generation');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/jd-assistant/generate/', { 
        message: originalMessage,
        analysis_data: analysisData 
      });
      
      const data = response.data;
      
      if (data.jd_text) {
        setGeneratedJD(data.jd_text);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: 'I\'ve generated your job description. You can edit it below and use the action buttons to save, copy, or download it.' 
        }]);
        setStatus('editing_jd');
      }
    } catch (error) {
      toast.error('Failed to generate JD. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error while generating the job description.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for missing fields
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    await generateJD(originalMessage, { ...formData, status: 'ready' }); // Use stored original message
    // Close form after submission
    setMissingFields([]);
  };

  // Handle form close
  const handleCloseForm = () => {
    setMissingFields([]);
    setCurrentFields({});
    setStatus('idle');
  };

  // Save JD
  const handleSaveJD = async () => {
    if (!generatedJD) return;
    
    try {
      setIsJDActionLoading(true);
      setActiveJDAction('save');
      const response = await axiosInstance.post('/jd-assistant/save/', { 
        jd_text: generatedJD 
      });
      
      if (response.data) {
        toast.success('Job description saved successfully!');
      } else {
        toast.error('Failed to save job description.');
      }
    } catch (error) {
      toast.error('Failed to save job description.');
    } finally {
      setIsJDActionLoading(false);
      setActiveJDAction(null);
    }
  };


  // Copy JD
  const handleCopyJD = () => {
    if (generatedJD) {
      setIsJDActionLoading(true);
      setActiveJDAction('copy');
      navigator.clipboard.writeText(generatedJD);
      toast.success('Job description copied to clipboard!');
      // Copy is sync; simulate brief loading for UX consistency
      setTimeout(() => {
        setIsJDActionLoading(false);
        setActiveJDAction(null);
      }, 400);
    }
  };

  // Download as DOCX
  const handleDownloadDOCX = async () => {
    if (!generatedJD) return;
    
    try {
      setIsJDActionLoading(true);
      setActiveJDAction('docx');
      const jdTitle = (generatedJD.split('\n')[0] || 'Job Description').trim() || 'Job Description';
      const doc = new Document({
        sections: [{
          properties: {},
          children: generatedJD.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun({ text: line || ' ', size: 24 })],
            })
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${jdTitle}.docx`);
      toast.success('DOCX downloaded successfully!');
    } catch (error) {
      console.error('DOCX error:', error);
      toast.error('Failed to download DOCX.');
    } finally {
      setIsJDActionLoading(false);
      setActiveJDAction(null);
    }
  };

  // Download as PDF
  const handleDownloadPDF = () => {
    if (!generatedJD) return;
    
    try {
      setIsJDActionLoading(true);
      setActiveJDAction('pdf');
      const jdTitle = (generatedJD.split('\n')[0] || 'Job Description').trim() || 'Job Description';
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const lineHeight = 7;
      const maxLineWidth = 180;
      
      // Split text into lines
      const lines = doc.splitTextToSize(generatedJD, maxLineWidth);
      let yPosition = margin;
      
      lines.forEach((line, index) => {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      doc.save(`${jdTitle}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to download PDF.');
    } finally {
      setIsJDActionLoading(false);
      setActiveJDAction(null);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-100 md:w-120 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2 text-gray-700">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">JD Assistant</span>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-[calc(100%-56px)] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">What can I help you do?</h2>
                  <p className="text-sm text-gray-600">I can help you create professional job descriptions</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">
                      {status === 'awaiting_analysis' ? 'Analyzing your request...' : 'Generating job description...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conditional Mini Form */}
          {missingFields.length > 0 && status === 'editing_jd' && (
            <div className="p-4">
              <MiniForm 
                fields={missingFields} 
                currentFields={currentFields}
                missingFields={missingFields}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                onClose={handleCloseForm}
              />
            </div>
          )}

          {/* JD Editor */}
          {generatedJD && status === 'editing_jd' && (
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Generated Job Description</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveJD}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer relative overflow-hidden"
                    disabled={isJDActionLoading}
                  >
                    {activeJDAction === 'save' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-600">
                        <div className="w-full h-0.5 bg-green-300 animate-pulse"></div>
                      </div>
                    )}
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCopyJD}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer relative overflow-hidden"
                    disabled={isJDActionLoading}
                  >
                    {activeJDAction === 'copy' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600">
                        <div className="w-full h-0.5 bg-blue-300 animate-pulse"></div>
                      </div>
                    )}
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer relative overflow-hidden"
                    disabled={isJDActionLoading}
                  >
                    {activeJDAction === 'docx' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-purple-600">
                        <div className="w-full h-0.5 bg-purple-300 animate-pulse"></div>
                      </div>
                    )}
                    <Download className="w-3 h-3" />
                    DOCX
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer relative overflow-hidden"
                    disabled={isJDActionLoading}
                  >
                    {activeJDAction === 'pdf' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-600">
                        <div className="w-full h-0.5 bg-red-300 animate-pulse"></div>
                      </div>
                    )}
                    <FileText className="w-3 h-3" />
                    PDF
                  </button>
                </div>
              </div>
              <textarea
                value={generatedJD}
                onChange={(e) => setGeneratedJD(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Generated job description will appear here..."
              />
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-3">
            <div className="rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder="What can I help you do?"
                className="w-full resize-none rounded-2xl px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <div className="flex items-center justify-end gap-2 px-3 py-2">
                <button
                  type="button"
                  className="text-[11px] text-white bg-blue-500 rounded-full px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Mini Form Component
const MiniForm = ({ fields, currentFields, missingFields, onSubmit, isLoading, onClose }) => {
  const [formData, setFormData] = useState({});
  const [validationTriggered, setValidationTriggered] = useState(false);

  // All possible fields (fixed schema)
  const ALL_FIELDS = ["name", "experience", "technology", "No_of_openings", "notice_period", "priority"];
  
  // Only experience and technology are required (name is optional since system suggests JD name)
  const REQUIRED_FIELDS = ["experience", "technology"];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if required fields are filled
    const missingRequired = REQUIRED_FIELDS.filter(field => {
      const value = formData[field] || currentFields[field] || '';
      return !value.trim();
    });
    
    if (missingRequired.length > 0) {
      setValidationTriggered(true);
      toast.error('Please fill in all required fields');
      return;
    }
    
    onSubmit({ ...currentFields, ...formData });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
          <p className="text-sm text-gray-600 mt-1">Please provide the following details to generate your job description</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Close form"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {ALL_FIELDS.map(field => {
            const isRequired = REQUIRED_FIELDS.includes(field);
            const currentValue = formData[field] || currentFields[field] || '';
            const showError = validationTriggered && isRequired && !currentValue.trim();
            
            return (
              <div key={field} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    id={`field-${field}`}
                    className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer ${
                      showError 
                        ? 'border-red-300 bg-red-50' 
                        : currentValue.trim()
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-300 bg-white'
                    }`}
                    placeholder=" "
                    value={currentValue}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`field-${field}`}
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      currentValue.trim()
                        ? 'text-xs text-blue-600 -top-2 bg-white px-1'
                        : 'text-sm text-gray-500 top-3'
                    }`}
                  >
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    This field is required
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 inline mr-2" />
                Generate JD
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSidebar;

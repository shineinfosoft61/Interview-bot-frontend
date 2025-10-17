import React from 'react';

const InterviewComplete = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Thank you!</h1>
        <p className="text-lg text-gray-700 mb-2">Your interview has been completed.</p>
        <p className="text-gray-600">We appreciate your time. Our team will review your responses and get back to you soon.</p>
      </div>
    </div>
  );
};

export default InterviewComplete;

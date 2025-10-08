import React from 'react';

const InterviewComplete = ({ answers, totalQuestions, resetInterview }) => {
    
  const handleDownloadResults = () => {
    const dataStr = JSON.stringify(answers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎉 Thank You!</h1>
          <p className="text-xl text-gray-700 mb-4">Congratulations on completing the interview!</p>
          <p className="text-gray-600 mb-6">
            You have successfully answered all {totalQuestions} questions. Your responses have been saved and will be reviewed by our team.
          </p>
          
          {/* Interview Statistics */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interview Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{answers.length}</div>
                <div className="text-gray-600">Responses Recorded</div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-600 mb-6">
            <p className="mb-2">✅ All questions completed</p>
            <p className="mb-2">💾 Responses automatically saved</p>
            <p>📧 You will be contacted with the results soon</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Interview Summary:</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {answers.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-800 mb-2">Q{index + 1}: {item.question?.text || item.question}</h4>
                <p className="text-gray-600 text-sm mb-2">{item.answer || 'No answer recorded'}</p>
                <p className="text-xs text-gray-500">Time spent: {Math.floor(item.timeSpent / 60)}:{(item.timeSpent % 60).toString().padStart(2, '0')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetInterview}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Start New Interview
          </button>
          <button
            onClick={handleDownloadResults}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Download Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewComplete;

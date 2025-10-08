// Interview Service for handling data storage and retrieval
class InterviewService {
  constructor() {
    this.storageKey = 'interviewSessions';
  }

  // Save interview session to localStorage (simulating database)
  saveInterviewSession(sessionData) {
    try {
      const existingSessions = this.getAllSessions();
      const sessionId = `session_${Date.now()}`;
      
      const newSession = {
        id: sessionId,
        timestamp: new Date().toISOString(),
        totalQuestions: sessionData.length,
        duration: this.calculateTotalDuration(sessionData),
        answers: sessionData,
        completed: true
      };

      existingSessions.push(newSession);
      localStorage.setItem(this.storageKey, JSON.stringify(existingSessions));
      
      return sessionId;
    } catch (error) {
      console.error('Error saving interview session:', error);
      return null;
    }
  }

  // Get all interview sessions
  getAllSessions() {
    try {
      const sessions = localStorage.getItem(this.storageKey);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error retrieving sessions:', error);
      return [];
    }
  }

  // Get specific session by ID
  getSessionById(sessionId) {
    try {
      const sessions = this.getAllSessions();
      return sessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  // Delete session
  deleteSession(sessionId) {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredSessions));
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Calculate total duration of interview
  calculateTotalDuration(answers) {
    return answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);
  }

  // Export session data as JSON
  exportSessionData(sessionId) {
    const session = this.getSessionById(sessionId);
    if (!session) return null;

    const exportData = {
      sessionInfo: {
        id: session.id,
        date: session.timestamp,
        totalQuestions: session.totalQuestions,
        totalDuration: `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}`
      },
      questionsAndAnswers: session.answers.map((item, index) => ({
        questionNumber: index + 1,
        question: item.question,
        answer: item.answer || 'No answer provided',
        timeSpent: `${Math.floor(item.timeSpent / 60)}:${(item.timeSpent % 60).toString().padStart(2, '0')}`,
        timestamp: item.timestamp
      }))
    };

    return exportData;
  }

  // Get interview statistics
  getInterviewStats() {
    const sessions = this.getAllSessions();
    
    return {
      totalSessions: sessions.length,
      totalQuestionsAnswered: sessions.reduce((total, session) => total + session.totalQuestions, 0),
      averageSessionDuration: sessions.length > 0 
        ? Math.round(sessions.reduce((total, session) => total + session.duration, 0) / sessions.length)
        : 0,
      lastInterviewDate: sessions.length > 0 
        ? new Date(Math.max(...sessions.map(s => new Date(s.timestamp)))).toLocaleDateString()
        : 'Never'
    };
  }

  // Clear all data
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('interviewAnswers'); // Remove old format data
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

// Create singleton instance
const interviewService = new InterviewService();

export default interviewService;

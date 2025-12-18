import axios from "axios";
import { INTERVIEW_API, CANDIDATE_API, ANSWER_API, HR_API, REQUIREMENT_API, PHOTO_API, REGISTER_API, CHAT_API, AI_QUETION_API, QUETION_BANK_API } from "../api/InterviewApi";
import { InterviewConstant } from "../constant/InterviewConstant";



function QuestionDetail(data) {
  return { type: InterviewConstant.ALL_QUESTION_DATA, data };
}

function CandidateDetail(data) {
  return { type: InterviewConstant.ALL_CANDIDATE_DATA, data };
}

function HrDocumentDetail(data) {
  return { type: InterviewConstant.ALL_HR_DOCUMENT_DATA, data };
}

function HrDocumentDetailById(data) {
  return { type: InterviewConstant.ALL_HR_DOCUMENT_DATA_BY_ID, data };
}

function CandidateAccess(data) {
  return { type: InterviewConstant.ALL_CANDIDATE_ACCESS, data };
}

function PhotoDetail(data) {
  return { type: InterviewConstant.ALL_PHOTO_DATA, data };
}

function RequirementDetail(data) {
  return { type: InterviewConstant.ALL_REQUIREMENT_DATA, data };
}

function UserDetail(data) {
  return { type: InterviewConstant.ALL_USER_DATA, data };
}

function ChatDetail(data) {
  return { type: InterviewConstant.ALL_CHAT_DATA, data };
}

function QuestioBankDetail(data) {
  return { type: InterviewConstant.ALL_QUESTIONBNK_DATA, data };
}

export const getQuestion = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`${INTERVIEW_API}${id}/`, {
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: "Bearer " + localStorage.getItem("workload-token"),
        // },
      });
      dispatch(QuestionDetail(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
};


export const getCandidateAccess = (candidateId) => {
  return async (dispatch) => {
    try {
      // Build API URL dynamically
      const url = `${HR_API}${candidateId}/`;
      const res = await axios.get(url, {
      });

      dispatch(CandidateAccess(res.data));
    } catch (error) {
      console.error("Error fetching candidate access:", error);
    }
  };
};


export const getPhoto = (candidateId) => {
  return async (dispatch) => {
    try {
      // Build API URL dynamically
      const url = `${PHOTO_API}${candidateId}/`;
      const res = await axios.get(url, {
      });

      dispatch(PhotoDetail(res.data));
    } catch (error) {
      console.error("Error fetching candidate access:", error);
    }
  };
};


export const getUserList = () => {
  return async (dispatch) => {
    try {
      // Build API URL dynamically
      const url = `${REGISTER_API}`;
      const res = await axios.get(url, {
      });

      dispatch(UserDetail(res.data));
    } catch (error) {
      console.error("Error fetching candidate access:", error);
    }
  };
};


export const getQuestionBankList = () => {
  return async (dispatch) => {
    try {
      // Build API URL dynamically
      const url = `${QUETION_BANK_API}`;
      const res = await axios.get(url, {
      });

      dispatch(QuestioBankDetail(res.data));
    } catch (error) {
      console.error("Error fetching question access:", error);
    }
  };
};
// Update existing User
export const updateUser = (id, data) => {
  return async (dispatch) => {
    try {
      const headers = { "Content-Type": "application/json" };
      const response = await axios.put(`${REGISTER_API}${id}/`, data, { headers });

      if (response.data) {
        // optionally refresh list here or let caller decide
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };
};

// Delete a requirement by UUID
export const deleteRequirement = (id) => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`${REQUIREMENT_API}${id}/delete/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 204 || response.data) {
        return { success: true };
      } else {
        return { success: false, error: "Failed to delete requirement" };
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
      return { success: false, error: error.message };
    }
  };
};

// Update existing HR document
export const updateHRDocument = (id, data) => {
  return async (dispatch) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data",}
        : { "Content-Type": "application/json",};

      const response = await axios.put(`${HR_API}${id}/`, data, { headers });

      if (response.data) {
        console.log("HR Document updated successfully", response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error updating HR Document:", error);
      return { success: false, error: error.message };
    }
  };
};


export const updateRequirement = (id, data) => {
  return async (dispatch) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`}
        : { "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`};

      const response = await axios.put(`${REQUIREMENT_API}${id}/`, data, { headers });

      if (response.data) {
        console.log("Requirement updated successfully", response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error updating Requirement:", error);
      return { success: false, error: error.message };
    }
  };  
};


export const getHrDocument = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get(HR_API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(HrDocumentDetail(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
};

import axiosInstance from '../../utils/axios';

export const getRequirement = () => {
  return async (dispatch) => {
    try {
      const res = await axiosInstance.get(REQUIREMENT_API);
      console.log('requirement', res.data);
      dispatch(RequirementDetail(res.data));
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error fetching requirements:", error);
      // The error will be automatically handled by the axios interceptor
      throw error;
    }
  };
};


export const getHrDocumentById = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`${HR_API}${id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      dispatch(HrDocumentDetailById(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
};


export const AddRegister = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(REGISTER_API, data, {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("workload-token")}`,
        },
      });

      if (response.data) {
        console.log("Candidate added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      return { success: false, error: error.response?.data?.email };
    }
  };
};

export const ChatApi = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(CHAT_API, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        dispatch(ChatDetail(response.data));
        console.log("chat added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding chat:", error);
      return { success: false, error: error.response?.data?.email };
    }
  };
};


export const addCandidate = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(CANDIDATE_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization: `Bearer ${localStorage.getItem("workload-token")}`,
        },
      });

      if (response.data) {
        dispatch(CandidateDetail(response.data));
        console.log("Candidate added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      return { success: false, error: error.message };
    }
  };
};

export const saveAnswer = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(ANSWER_API, data, {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("workload-token")}`,
        },
      });

      if (response.data) {
        console.log("Answer added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding answer:", error);
      return { success: false, error: error.message };
    }
  };
};

export const saveAiQuestion = (candidateId, data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${AI_QUETION_API}${candidateId}/`, data, {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("workload-token")}`,
        },
      });

      if (response.data) {
        console.log("Question added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding Question:", error);
      return { success: false, error: error.message };
    }
  };
};

export const saveHRDocument = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(HR_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("HR document added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding HR document:", error);
      return { success: false, error: error.response?.data?.details };
    }
  };
};

export const saveQuestion = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(INTERVIEW_API, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Question added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

export const saveQuestionBank = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(QUETION_BANK_API, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Question added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

// Upload questions via file
export const uploadQuestionsFile = (formData) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(INTERVIEW_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Questions uploaded successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error uploading questions:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

// Get questions for a candidate or all questions
export const getQuestions = (candidateId = null, searchQuery = '', technologies = []) => {
  return async (dispatch) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (technologies.length > 0) {
        params.append('technologies', technologies.join(','));
      }
      
      const url = candidateId 
        ? `${INTERVIEW_API}${candidateId}/?${params.toString()}` 
        : `${INTERVIEW_API}?${params.toString()}`;
        
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        // Dispatch the questions to Redux store
        dispatch({
          type: InterviewConstant.ALL_QUESTION_DATA,
          data: response.data
        });
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      return { success: false, error: error.message };
    }
  };
};

// Update a specific question
export const updateQuestion = (questionId, data) => {
  return async (dispatch) => {
    try {
      const response = await axios.put(`${INTERVIEW_API}${questionId}/`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Question updated successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error updating question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

export const updateQuestionBank = (questionId, data) => {
  return async (dispatch) => {
    try {
      const response = await axios.put(`${QUETION_BANK_API}${questionId}/`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Question updated successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error updating question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

// Delete a specific question
export const deleteQuestion = (questionId) => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`${INTERVIEW_API}${questionId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 204 || response.data) {
        console.log("Question deleted successfully");
        return { success: true };
      } else {
        console.log("Failed to delete question");
        return { success: false, error: "Failed to delete question" };
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

export const deleteQuestionBank = (questionId) => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`${QUETION_BANK_API}${questionId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 204 || response.data) {
        console.log("Question deleted successfully");
        return { success: true };
      } else {
        console.log("Failed to delete question");
        return { success: false, error: "Failed to delete question" };
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      return { success: false, error: error.response?.data?.details || error.message };
    }
  };
};

// Get all enums (technologies, difficulty levels, etc.)
export const getEnums = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`${INTERVIEW_API.replace('/questions/', '')}/enums/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error fetching enums:", error);
      return { success: false, error: error.message };
    }
  };
};

// Get technology choices
export const getTechnologyChoices = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`${INTERVIEW_API.replace('/questions/', '')}/technology-choices/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error fetching technology choices:", error);
      return { success: false, error: error.message };
    }
  };
};

export const saveRequirement = (formData) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(REQUIREMENT_API, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Requirement added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding requirement:", error);
      return { success: false, error: error.message };
    }
  };
};


export const savePhoto = (id,data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${PHOTO_API}${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        console.log("Photo added successfully", response.data);
        return { success: true, data: response.data };
      } else {
        console.log("No data in the response");
        return { success: false, error: "No data in response" };
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      return { success: false, error: error.message };
    }
  };
};



export const updateproject = (id, data) => {
  return async (dispatch) => {
    try {
      const response = await axios.put(`${AddProject}${id}/`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("workload-token")}`,
        },
      });

      if (response.data) {
        dispatch(PdfConstant());
        console.log("Project updated successfully");
      } else {
        console.log("No data in the response");
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };
};



export const PdfDataAction = {
  AddRegister,
  addCandidate,
  getQuestion,
  updateproject,
  saveAnswer,
  saveHRDocument,
  getHrDocument,
  updateHRDocument,
  getHrDocumentById,
  savePhoto,
  saveRequirement,
  getRequirement,
  updateRequirement,
  saveQuestion,
  uploadQuestionsFile,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getEnums,
  getTechnologyChoices,
  getUserList,
  updateUser,
  ChatApi,
  saveAiQuestion,
  getQuestionBankList,
  updateQuestionBank,
  saveQuestionBank,
  deleteQuestionBank,
};
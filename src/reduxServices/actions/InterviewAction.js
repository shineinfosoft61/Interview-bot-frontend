import axios from "axios";
import { INTERVIEW_API, CANDIDATE_API, ANSWER_API, HR_API, REQUIREMENT_API,PHOTO_API } from "../api/InterviewApi";
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

export const getQuestion = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get(INTERVIEW_API, {
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
      const url = `${CANDIDATE_API}${candidateId}/`;
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

// Update existing HR document
export const updateHRDocument = (id, data) => {
  return async (dispatch) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

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
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

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
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: "Bearer " + localStorage.getItem("workload-token"),
        // },
      });
      dispatch(HrDocumentDetail(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
};

export const getRequirement = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get(REQUIREMENT_API, {
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: "Bearer " + localStorage.getItem("workload-token"),
        // },
      });
      console.log('requirement', res.data);
      dispatch(RequirementDetail(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
};


export const getHrDocumentById = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`${HR_API}${id}/`, {
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: "Bearer " + localStorage.getItem("workload-token"),
        // },
      });
      dispatch(HrDocumentDetailById(res.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
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

export const saveHRDocument = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(HR_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      return { success: false, error: error.message };
    }
  };
};

export const saveQuestion = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(INTERVIEW_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      return { success: false, error: error.message };
    }
  };
};

export const saveRequirement = (formData) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(REQUIREMENT_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
  // loginHandler,
  // userDetailsHandler,
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
};
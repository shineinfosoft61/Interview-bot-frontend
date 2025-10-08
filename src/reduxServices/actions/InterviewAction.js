import axios from "axios";
import { INTERVIEW_API, CANDIDATE_API, ANSWER_API } from "../api/InterviewApi";
import { InterviewConstant } from "../constant/InterviewConstant";



function QuestionDetail(data) {
  return { type: InterviewConstant.ALL_QUESTION_DATA, data };
}

function CandidateDetail(data) {
  return { type: InterviewConstant.ALL_CANDIDATE_DATA, data };
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
  // allUserDetail,
};
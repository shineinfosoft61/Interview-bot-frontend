import { InterviewConstant } from "../constant/InterviewConstant";

const initailState = {
    questions: [],
    candidate: [],
    hrDocument: [],
    candidateAccess: [],
    
};


export default function InterviewReducer(state = initailState, action) {
    switch (action.type) {


      case InterviewConstant.ALL_QUESTION_DATA:
        return { ...state, questions: [...state.questions, action.data] };

      case InterviewConstant.ALL_CANDIDATE_DATA:
        return { ...state, candidate: [...state.candidate, action.data] };

      case InterviewConstant.ALL_HR_DOCUMENT_DATA:
        return { ...state, hrDocument: action.data };

      case InterviewConstant.ALL_CANDIDATE_ACCESS:
        return { ...state, candidateAccess: action.data };

      default:
        return state;
    }
  }
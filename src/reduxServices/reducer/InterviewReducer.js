import { InterviewConstant } from "../constant/InterviewConstant";

const initailState = {
    questions: [],
    candidate: [],
    hrDocument: [],
    candidateAccess: [],
    hrDocumentById: [],
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

      case InterviewConstant.ALL_HR_DOCUMENT_DATA_BY_ID:
        return { ...state, hrDocumentById: action.data };

      default:
        return state;
    }
  }
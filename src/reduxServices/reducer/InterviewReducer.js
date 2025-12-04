import { InterviewConstant } from "../constant/InterviewConstant";

const initailState = {
    questions: [],
    candidate: [],
    hrDocument: [],
    candidateAccess: [],
    hrDocumentById: [],
    photo: [],
    requirement: [],
    user: [],
    chat: [],
};


export default function InterviewReducer(state = initailState, action) {
    switch (action.type) {


      case InterviewConstant.ALL_QUESTION_DATA:
        return { ...state, questions: action.data };

      case InterviewConstant.ALL_CANDIDATE_DATA:
        return { ...state, candidate: [...state.candidate, action.data] };

      case InterviewConstant.ALL_HR_DOCUMENT_DATA:
        return { ...state, hrDocument: action.data };

      case InterviewConstant.ALL_CANDIDATE_ACCESS:
        return { ...state, candidateAccess: action.data };

      case InterviewConstant.ALL_HR_DOCUMENT_DATA_BY_ID:
        return { ...state, hrDocumentById: action.data };

      case InterviewConstant.ALL_PHOTO_DATA:
        return { ...state, photo: action.data };
      
      case InterviewConstant.ALL_REQUIREMENT_DATA:
        return { ...state, requirement: action.data };

      case InterviewConstant.ALL_USER_DATA:
        return { ...state, user: action.data };

      case InterviewConstant.ALL_CHAT_DATA:
        return { ...state, chat: [...state.chat, action.data]};

      default:
        return state;
    }
  }
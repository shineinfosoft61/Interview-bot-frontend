// import { userDataConstants } from "../Constants/userData.constants";

const initailState = {
    userData: null,
  };
  
  export default function Reducer_1(state = initailState, action) {
    switch (action.type) {
      // case userDataConstants.SUCCESS:
      //   return { ...state, userData: "hello", auth: true };
  
      default:
        return state;
    }
  }

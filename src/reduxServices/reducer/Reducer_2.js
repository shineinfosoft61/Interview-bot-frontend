// import { userDataConstants } from "../Constants/userData.constants";

const initailState = {
    userData: "shiv",
  };
  
  export default function Reducer_2(state = initailState, action) {
    switch (action.type) {
      // case userDataConstants.SUCCESS:
      //   return { ...state, userData: "hello", auth: true };
  
      default:
        return state;
    }
  }
  
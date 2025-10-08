import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import {thunk} from 'redux-thunk';
import Reducer_1 from "./reduxServices/reducer/Reducer_1";
import Reducer_2 from "./reduxServices/reducer/Reducer_2";
import InterviewReducer from "./reduxServices/reducer/InterviewReducer";


// import { createLogger } from "redux-logger";
// const loggerMiddleware = createLogger();

const rootReducer = combineReducers({
  reducer_1: Reducer_1,
  reducer_2: Reducer_2,
  InterviewReducer: InterviewReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

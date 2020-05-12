import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';

let store = createStore(reducer, applyMiddleware(thunk));
export default store;

//thunk 的作用即是支持 dispatch(function(){})
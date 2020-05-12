import { combineReducers } from 'redux';
import * as CONS from '../actions/index';

const setBlogSource = (state = [], action) => {
    switch(action.type){
        case CONS.REQ_DATA: {
            return state;
        }
        case CONS.REC_DATA: {
            if(action.data.length === state.length) return state;
            else return action.data;
        }
        case CONS.REQ_ERROR: {
            console.error(action.error);
            return null;
        }
        case CONS.SHOW_BY_ID: {
            return state.filter(blog => blog.id == action.id)
        }
        default:
            return state;
    }
}
const showBlog = (state = [], action) => {
    switch(action.type){
        case CONS.SHOW_BY_ID + 'sd': {
            // console.log(state)
            return state.filter(blog => blog.id == action.id)
        }
        default:
            return state;
    }
}
export default combineReducers({
    setBlogSource,
    showBlog
});
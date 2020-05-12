import * as CONS from '../actions/index';
import Get from '../tool/Request';

function getBlogSource(blogUrl){
    return (dispatch, getState) => {
        dispatch({
            type: CONS.REQ_DATA
        });
        let res = Get(blogUrl);
        res.then(blog => {
            blog.sort((a, b) => a.comment.date > b.comment.date ? -1 : 1);
            dispatch({
                type: CONS.REC_DATA,
                data: blog
            })
        })
        .catch(err => dispatch({
            type: CONS.REQ_ERROR,
            error: err
        }));
    }
}
function handleBlogDetail(blogUrl, id){
    return (dispatch, getState) => {
        if(getState().setBlogSource.length === 0){
            //直接进入二级路由
            dispatch({
                type: CONS.BLOG_NOT_LOADED
            });
            let res = Get(blogUrl);
            res.then(blog => {
                blog.sort((a, b) => a.comment.date > b.comment.date ? -1 : 1);
                dispatch({
                    type: CONS.REC_DATA,
                    data: blog
                });
                dispatch({
                    type: CONS.SHOW_BY_ID,
                    id: id
                });
            })
            .catch(err => dispatch({
                type: CONS.REQ_ERROR,
                error: err
            }));
        }
        //由一级路由进入
        else{
            dispatch({
                type: CONS.SHOW_BY_ID,
                id: id
            });
        };
    }
}
export {
    getBlogSource,
    handleBlogDetail
}
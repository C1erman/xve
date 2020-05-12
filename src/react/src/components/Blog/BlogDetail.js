import React, { Component } from 'react';
import { connect } from 'react-redux';
import { handleBlogDetail } from '../../reducers/data'
import { slideUp } from '../../tool/slideUp';
import RightBar from '../RightBar/RightBar';
import './BlogDetail.css';

const mapStateToProps = (state) => {
    return {
        blog : state.setBlogSource
    }
}
const mapDispatchToProps = (dispatch) => {
    // 异步 dispatch
    let jsonUrl = './json/source.json';  //可配置项
    return {
        getBlogById : (id) => dispatch(handleBlogDetail(jsonUrl, id))
    }
}

class BlogDetail extends Component{
    componentDidMount(){
        slideUp();
        const { getBlogById } = this.props;
        const { id } = this.props.match.params;
        getBlogById(id);
        
    }
    render(){
        const { blog } = this.props;
        return (
            <div className='blog-detail-wrapper'>
                <div className='blog-detail-post'>
                    <div className='blog-summary'>
                        <span className='blog-title'  dangerouslySetInnerHTML={{__html : blog[0] ? blog[0].comment.title : ''}}></span>
                        <div className='blog-mate'>
                            <span>写于 {blog[0] ? blog[0].comment.date : ''}</span>
                        </div>
                    </div>
                    <article className='blog-inner' dangerouslySetInnerHTML={{__html : blog[0] ? blog[0].summary.join('\n') : ''}}></article>
                    <div className='blog-detail-all' dangerouslySetInnerHTML={{__html : blog[0] ? blog[0].content.join('\n') : ''}}></div>
                </div>
                <RightBar anchors={blog[0] ? blog[0].anchors : []} container={{
                    type : 'class',
                    value : 'blog-detail-wrapper'
                }}/>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlogDetail);
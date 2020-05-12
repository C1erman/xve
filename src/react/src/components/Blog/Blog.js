import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Paging from '../Paging/Paging';
import ToTop from '../ToTop/ToTop';
import { slideUp } from '../../tool/slideUp';
import './Blog.css';
//react redux
import { connect } from 'react-redux';
import { getBlogSource } from '../../reducers/data'
//config.js
import config from '../../config.json';

const mapStateToProps = (state) => {
    return {
        blog : state.setBlogSource
    }
}
const mapDispatchToProps = (dispatch) => {
    // 异步 dispatch
    let jsonUrl = config.jsonPath;  //可配置项
    return {
        getBlogSource : () => dispatch(getBlogSource(jsonUrl))
    }
}

class Blog extends Component{
    constructor(props){
        super(props);

        this.state = {
            blog : [],  //所有内容，后续这里会改成内容的提炼
            currentPage : + localStorage.getItem('currentPage') || 0,  //当前页码
            currentBlog : [],  //当前页码内的内容
            numsPerpage : 5  //每页的内容数
        }
    }
    componentDidMount(){
        let { getBlogSource } = this.props;
        getBlogSource();
    }
    componentWillUnmount(){
        localStorage.removeItem('currentPage')
    }
    static getDerivedStateFromProps(props, state){
        let { blog } = props;
        let numsPerpage = 5;  //可从 config.js 进行配置
        let pageNum = state.currentPage;
        let leftIndex = pageNum * numsPerpage,
            rightIndex = leftIndex + numsPerpage > blog.length ? blog.length : leftIndex + numsPerpage;
        let tmpBlog = blog.slice(leftIndex, rightIndex);
        let tmpBlogId = tmpBlog.map(blog => blog.id),
            currentBlogId = state.currentBlog.map(blog => blog.id);
        if(tmpBlogId.join('') !== currentBlogId.join('')){
            //从 blogDetail 返回 或 首次进入
            return {
                ...state,
                blog : blog,
                currentBlog : tmpBlog,
                numsPerpage : numsPerpage
            }
        }
        else{
            //经过 handleChangePage 之后的再次渲染
            return {
                ...state,
                currentPage : + localStorage.getItem('currentPage')
            }
        }
    }
    render(){
        let { blog, numsPerpage, currentBlog, currentPage} = this.state;
        let totalPageSize = numsPerpage == 0 ? 1 : Math.ceil(blog.length / numsPerpage);
        return (
            <div className='blog-wrapper'>
                <div className='blog-content'>
                    {currentBlog.map((v, i, array) => 
                        <div key={'post' + i} className='blog-post'>
                            <div className='blog-summary'>
                                <Link className='blog-title' to={v.id ? '/blog/' + v.id : ''} dangerouslySetInnerHTML={{__html : v.comment ? v.comment.title : ''}}></Link>
                                <div className='blog-mate'>
                                    <span>写于 {v.comment ? v.comment.date : ''}</span>
                                </div>
                            </div>
                            <article className='blog-inner' key={i} dangerouslySetInnerHTML={{__html : v.summary ? v.summary.join('\n') : ''}}></article>
                            <div className='blog-more'>
                                <Link to={v.id ? '/blog/' + v.id : ''} key={'btn' + i} className='blog-more-click'>阅读全文 →</Link>
                            </div>
                            {i != array.length - 1 ? <footer className='blog-footer'>
                                <div className='blog-footer-content'></div>
                            </footer>: null}
                        </div>
                    )}
                </div>
                <Paging currentPage={currentPage} totalPageSize={totalPageSize} callback={this.handleChangePage} />
                <ToTop />
            </div>
        );
    }
    handleChangePage = (pageNum) => {
        if(pageNum == this.state.currentPage) return false;
        else{
            let {blog, numsPerpage} = this.state;
            let leftIndex = pageNum * numsPerpage,
                rightIndex = leftIndex + numsPerpage > blog.length ? blog.length : leftIndex + numsPerpage;
            localStorage.setItem('currentPage', pageNum);
            this.setState({
                currentBlog : this.state.blog.slice(leftIndex, rightIndex),
                currentPage : pageNum
            })
            slideUp();
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Blog);
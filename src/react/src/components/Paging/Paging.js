import React, { Component } from 'react';
import './Paging.css';

export default class Paging extends Component{
    constructor(props){
        super(props);
        const {currentPage, totalPageSize, callback} = props;
        this.state = {
            currentPage : currentPage || 0,  //当前页码
            totalPageSize : totalPageSize || 4,  //总页数
            callback : callback || function(){ console.log('callback') }  //回调函数
        }
    }
    setPage = (pageNum, callback) => {
        if(pageNum < 0 || pageNum >= this.state.totalPageSize) return false;
        else this.setState({
            currentPage : pageNum
        })
        typeof callback == 'function' ? callback(pageNum) : null;
    }
    prevPage = (callback) => {
        let currentPage = this.state.currentPage;
        if(currentPage == 0) return false;
        else{
            this.setState({
                currentPage : currentPage - 1
            })
        }
        typeof callback == 'function' ? callback(this.state.currentPage - 1) : null;
    }
    nextPage = (callback) => {
        let currentPage = this.state.currentPage,
            totalPageSize = this.state.totalPageSize;
        if(currentPage == totalPageSize - 1) return false;
        else{
            this.setState({
                currentPage : currentPage + 1
            })
        }
        typeof callback == 'function' ? callback(this.state.currentPage + 1) : null;
    }
    static getDerivedStateFromProps(props, state){
        return {
            ...props,
            currentPage : state.currentPage
        };
    }
    render(){
        let {
            currentPage,    //当前页数
            totalPageSize,  //总页数
            callback  //回调函数
        } = this.state;
        return (
            <ul className='paging-controller'>
                <li className={ 'paging-prev ' + (currentPage == 0 ? 'paging-prev-disabled' : '')}
                    title='上一页'
                    onClick={() => this.prevPage(callback)}>
                    <a className='paging-control'></a>
                </li>
                {(Array(totalPageSize)).fill(null).map((v,i) => <li
                    className={'paging-item ' + (currentPage == i ? 'paging-item-active' : '')}
                    onClick={() => this.setPage(i, callback)}
                    key={i}
                    title={i + 1}>
                    <a>{i + 1}</a>
                </li>)}
                <li className={ 'paging-next ' + (currentPage == totalPageSize - 1 ? 'paging-next-disabled' : '')}
                    title='下一页'
                    onClick={() => this.nextPage(callback)}>
                    <a className='paging-control'></a>
                </li>
            </ul>
        );
    }
}
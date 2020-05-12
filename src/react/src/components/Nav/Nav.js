import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import './Nav.css';
import config from '../../config.json';

export default class Nav extends Component{
    constructor(props){
        super(props);
        this.state = {
            title : config.title
        }
    }
    render() {
        return (
            <div className='top-nav'>
                <div className='top-nav-wrapper'>
                    <div className='icon'>{this.state.title || '标题'}</div>
                    <div className='links'>
                        <NavLink exact to='/'>首页</NavLink>
                        <NavLink to='/blog'>博客</NavLink>
                        <NavLink to='/about'>关于我的事</NavLink>
                        <NavLink to='/talking'>闲言碎语</NavLink>
                    </div>
                </div>
            </div>
        )
    }
}
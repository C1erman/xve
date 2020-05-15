import React, { Component } from "react";
import './Home.css';
import homeImg from '../../icon/home.png';
//config.json
import config from '../../config.json';

export default class Home extends Component{
    render(){
        return (
            <div className='home-wrapper'>
                <img className='home-img' alt='首页封面图' src={homeImg} />
                <div className='home-content'>
                    <div className='home-self'>
                        {config.homePageSelf}
                    </div>
                    <div className='home-text'>
                        {config.homePageText.map((text, index) => 
                            <div key={text} style={{textAlign: index % 2 ? 'left' : 'right'}} className='home-text-item'>{text}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
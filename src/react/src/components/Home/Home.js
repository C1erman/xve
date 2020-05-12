import React, { Component } from "react";
import Carousel from '../Carousel/Carousel'; 
import './Home.css';

export default class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            imgs : [
                {
                    linkTo : '',
                    src : 'https://i.loli.net/2020/01/02/BntKIuELhfayeJG.jpg'
                },
                {
                    linkTo : '',
                    src : 'https://i.loli.net/2020/01/02/BntKIuELhfayeJG.jpg'
                },
                {
                    linkTo : '',
                    src : 'https://i.loli.net/2020/01/02/BntKIuELhfayeJG.jpg'
                }
            ]
        }
    }
    render(){
        return (
            <div className='home-wrapper'>
                <div className='home-content'>
                    <Carousel imgs={this.state.imgs} config={{height : '300px'}} />
                </div>
            </div>
        );
    }
}
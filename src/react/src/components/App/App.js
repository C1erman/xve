import React, { Component } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Home from "../Home/Home";
import Nav from "../Nav/Nav";
import Blog from "../Blog/Blog";
import BlogDetail from "../Blog/BlogDetail";
import Footer from "../Footer/Footer";
//import css
import './App.css';
//redux
import { Provider } from 'react-redux';
import store from '../../reducers/index';

export default class App extends Component{
    render(){
        return (
            <Provider store={store}>
                <Router>
                    <Nav />
                    <div id='container'>
                        <Route path='/' exact component={Home} />
                        <Switch>
                            <Route exact path='/blog' component={Blog} />
                            <Route path='/blog/:id' component={BlogDetail} />
                        </Switch>
                        <Route path='/about' component={''} />
                    </div>
                    <Footer />
                </Router>
            </Provider>
        );
    }
    componentWillUnmount(){
        localStorage.removeItem('currentPage')
    }
}
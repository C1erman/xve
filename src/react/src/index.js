import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import './index.css';

ReactDOM.render(<App />,
    document.getElementById('app'));
//供WEBPACK热更新使用
if(module.hot){
    module.hot.accept();
}
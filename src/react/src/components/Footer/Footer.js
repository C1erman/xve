import React from 'react';
import './Footer.css';

const Footer = () => {
    let fromTime = 2017,
        endTime = (new Date()).getFullYear();
    let copyright = 'c1er And U';  //个人版权声明 可从config.json 文件导入
    let xve = true;
    let custom = '<del>铁甲依然在你妹</del>'
    return (
        <footer className='footer-wrapper'>
            <div className='copyright'>{`© ${fromTime} - ${endTime} ${copyright}`}</div>
            {xve ? <div className='powered-by'>
                由<a href='https://seefun.site' title='xve'>xve</a>强力驱动
            </div> : null}
            <div className='division'></div>
            <div className='custom' dangerouslySetInnerHTML={{__html : custom}}></div>
        </footer>
    );
}
export default Footer;
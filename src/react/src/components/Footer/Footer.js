import React from 'react';
import './Footer.css';
//config.json
import config from '../../config.json';

const Footer = () => {
    let fromTime = config.footerFromTime,
        endTime = (new Date()).getFullYear();
    let copyright = config.footerCopyRight;
    return (
        <footer className='footer-wrapper'>
            <svg 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 310">
                <path
                    fill="#1a1a1a"
                    fillOpacity="1"
                    d="M0,128L40,117.3C80,107,160,85,240,90.7C320,96,400,128,480,138.7C560,149,640,139,720,154.7C800,171,880,213,960,202.7C1040,192,1120,128,1200,117.3C1280,107,1360,149,1400,170.7L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z">
                </path></svg>
            <div className='footer-other'>
                <div className='copyright'>{`© ${fromTime} - ${endTime} ${copyright}`}</div>
                {config.showPower ? <div className='powered-by'>
                    由<a href='https://github.com/C1erman/xve' title='xve'>xve</a>强力驱动
                </div> : null}
                {config.footerCustom.length ? <div className='division'></div> : ''}
                <div className='custom' dangerouslySetInnerHTML={{__html : config.footerCustom}}></div>
            </div>
        </footer>
    );
}
export default Footer;
import React, { useRef, useEffect } from 'react';
import './ToTop.css';
import { slideUpDom } from '../../tool/slideUp';

const ToTop = () => {
    const dom = useRef(null);
    useEffect(() => {
        slideUpDom(dom.current);
    }, [])
    return (
        <div className='to-top'>
            <i className='to-top-arrow' ref={dom}></i>
        </div>
    );
}

export default ToTop;
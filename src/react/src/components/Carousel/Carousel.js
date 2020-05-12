import React, { useRef, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({imgs, config}) => {
    const container = useRef(null);
    useEffect(() => {
        const cont = [...container.current.childNodes];

    },[])
    return (
        <div className='carousel-container' ref={container} style={{height : config.height}}>
            {imgs.map((img, index) => <div key={img.src + index} className='carousel-items'>
                <a href={img.linkTo}>
                    <img className='carousel-imgs' src={img.src} title={img.linkTitle} />
                </a>
            </div>)}
        </div>
    );
}

export default Carousel;
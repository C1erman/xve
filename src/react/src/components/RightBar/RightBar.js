import React, { useEffect } from 'react';
import {slideToDom} from '../../tool/slideUp';
import './RightBar.css'

const RightBar = ({anchors, container}) => {
    let config = { onGoing : false};

    useEffect(() => {
        window.onscroll = function(){
            let lengthToTop = document.documentElement.scrollTop || document.body.scrollTop;
            let screenHeight = document.documentElement.clientHeight || window.innerHeight; 
            let fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

            let lis = [...document.querySelectorAll('.right-bar-ul > li')];
            let highLightLis = anchors.filter(anchor => {
                let yin = document.getElementById(anchor.id);
                return yin.offsetTop <= lengthToTop || fullHeight === lengthToTop + screenHeight;
            }).map(anchor => anchor.id);
            lis.forEach(li => highLightLis.includes(li.dataset.id) ? li.classList.add('right-bar-light') : li.classList.remove('right-bar-light'))
        }
    },[anchors])

    return (
        <aside className='right-bar'>
            <div className='right-bar-wrapper'>
                <div className='right-bar-main'>文章目录</div>
                <ul className='right-bar-ul'>
                    {anchors.map((anchor, index) => {
                        let {id, level, text} = anchor;
                        return (
                            <li key={id + index} data-id={id} className={'li' + level} onClick={() => { scrollToAnchor(id, container, config) }}>{text}</li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
function scrollToAnchor(domId, container, config){
    let dom = document.getElementById(domId);
    slideToDom(dom, config);
}

export default RightBar;
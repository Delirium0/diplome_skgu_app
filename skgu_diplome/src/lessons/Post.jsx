import React from 'react';
import './style.css'
const Post = ({post_info}) => {
    return (
            <div className='main-container'>
                
                <h1>{post_info.title}</h1>
                <div className='description'>
                    <p>{post_info.desc} </p>
                    <p>{post_info.likes}</p>
                </div>


            </div>
    );
};

export default Post;
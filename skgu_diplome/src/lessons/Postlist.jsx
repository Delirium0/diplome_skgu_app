import React, { useState } from 'react';
import Post from './Post';
const Postlist = () => {
    const [posts, setPosts] = useState([
        {id: 1, title: '11hz', desc: 'hz', likes: '1556'},
        {id: 2, title: '22hz', desc: 'hz', likes: 'h11z'}, 
        {id: 3, title: '33hz', desc: 'hz', likes: '1'}, 
      ]);
    return (
        <div>
            {posts.map(post => 
            <Post post_info={post} key={post.id}></Post>
            )}
        </div>
    );
};

export default Postlist;
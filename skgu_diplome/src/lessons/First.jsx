import React, { useState } from 'react';

const First = () => {
    const [count, setCount] = useState(0)

    function addCount(){
        setCount(count + 1)
    }
    return (
        <div>
            <button onClick={addCount}>qefqef</button>
            <p>{count}</p>
        </div>

    );
};

export default First;
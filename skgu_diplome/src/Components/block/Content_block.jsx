import React from "react";
import cl from "./Content_block.module.css";
const Content_block = ({props}) => {
  return (
    <div className={`card`}>
        {props.ch}
    </div>
  );
};

export default Content_block;

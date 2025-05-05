// AccountBlock.js (или Faculty.js, если вы переименовали)
import React from "react";
import cl from "./Account.module.css"; // Используем Account.module.css для стилей

const AccountBlock = ({ blockInfo }) => {
  // blockInfo вместо event_info для ясности
  return (
    <a href={blockInfo.linkTo} className={cl.faculties}>
      <div className={cl.faculties}>
        <div className={cl.faculty_icon}>
          <blockInfo.SvgComponent className={cl.progress_icon} />
        </div>
        <div>
          {blockInfo.name}
        </div>
      </div>
    </a>
  );
};

export default AccountBlock;

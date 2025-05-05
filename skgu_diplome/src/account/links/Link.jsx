import React from "react";
import styles from "./Links.module.css"; // Импортируем стили из Links.module.css, так как вы их используете

const Link = ({ icon: Icon, href, text }) => {
  return (
    <a
      href={href}
      className={styles.faculties}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.left_block}>
        <div className={styles.faculty_icon}>
          {Icon && <Icon className={styles.faculty_icon} />}{" "}
        </div>
        <div className={styles.link_text}>{text}</div>
      </div>
      <div className={styles.right_block}>
      ➔
      </div>

    </a>
  );
};

export default Link;

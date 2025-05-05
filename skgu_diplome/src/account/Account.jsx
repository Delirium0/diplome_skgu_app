import React from "react";
import cl from "./Account.module.css";
import AccountBlock from "./AccountBlock.jsx";
import Footer from "../Components/Footer/Footer";

// Импортируйте ваши SVG как React компоненты
import { ReactComponent as Raiting } from '../assets/svg/chart-line-svgrepo-com (1).svg'; // Убедитесь, что путь верный
import { ReactComponent as Schedule } from '../assets/svg/calendar-days-svgrepo-com.svg';
import { ReactComponent as Exams } from '../assets/svg/certificate-ssl-svgrepo-com.svg';
import { ReactComponent as Links } from '../assets/svg/link-alt-1-svgrepo-com.svg';
import { ReactComponent as Svg5 } from '../assets/svg/arrow_down.svg';
import { ReactComponent as Rating } from '../assets/svg/rating-svgrepo-com.svg';

const Account = () => {
  const blockData = [
    { name: "Рейтинг", linkTo: "/raiting", SvgComponent: Raiting },
    { name: "Расписание", linkTo: "/schedule", SvgComponent: Schedule }, 
    { name: "Результаты экзаменов", linkTo: "/exams", SvgComponent: Exams }, 
    { name: "Важные ссылки", linkTo: "/links", SvgComponent: Links },
    { name: "Мероприятия", linkTo: "/events_create", SvgComponent: Svg5 },
    { name: "Оставить отзыв", linkTo: "/feetback", SvgComponent: Rating },
  ];

  return (
    <div className={cl.main_block}>
      <div className={cl.account_container}>
        {blockData.map((block, index) => (
          <AccountBlock key={index} blockInfo={block} />
        ))}
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Account;
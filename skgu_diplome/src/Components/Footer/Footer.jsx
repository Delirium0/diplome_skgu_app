import React from "react";
import cl from "./Footer.module.css";
import homeIcon from "./home-icon-silhouette-svgrepo-com.svg";
import accuntIcon from "./account-svgrepo-com.svg";
import searchIcon from "./search-svgrepo-com.svg";
import arIcon from "./vr-glasses-goggles-headset-remove-svgrepo-com.svg";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <div className={cl.footer_container}>
      <div className={cl.home_block}>
        <Link to="/">
          <img
            className={cl.footer_home_image}
            src={homeIcon}
            alt="Home icon"
          />
        </Link>
      </div>

      <div className={cl.home_block}>
        <Link to="/search">
          <img
            className={cl.footer_home_image}
            src={searchIcon}
            alt="search icon"
          />
        </Link>
      </div>
      <div className={cl.home_block}>
        <Link to="/ar_page">
          <img
            className={cl.footer_home_image}
            src={arIcon}
            alt="account icon"
          />
        </Link>
      </div>
      <div className={cl.home_block}>
        <Link to="/account">
          <img
            className={cl.footer_home_image}
            src={accuntIcon}
            alt="account icon"
          />
        </Link>
      </div>

    </div>
  );
};

export default Footer;

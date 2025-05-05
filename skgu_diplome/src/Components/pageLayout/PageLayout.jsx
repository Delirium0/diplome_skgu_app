// PageLayout.js
import React from 'react';
import styles from './PageLayout.module.css';
import Header from '../header/Header';
import Footer from '../Footer/Footer';
const PageLayout = ({ children }) => {
  return (
    <div className={styles.pageLayout}>
      <Header />
      <main className={styles.content}>
        {children}
      </main>
      <Footer></Footer>
    </div>
  );
};

export default PageLayout;
import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  // Initialize the input with last 7 days
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const priorDate = new Date().setDate(today.getDate() - 6); // last 7 days
    setStartDate(new Date(priorDate).toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const handleReset = () => {
    const today = new Date();
    const priorDate = new Date().setDate(today.getDate() - 6);
    setStartDate(new Date(priorDate).toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const handleSubmit = () => {
    alert(`Selected Date Range: ${startDate} – ${endDate}`);
    // Do your submit logic here
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dateRangeContainer}>
        <label className={styles.dateLabel}>Date Range Pick</label>

        <div className={styles.dateRange}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <span style={{ margin: "0 8px" }}>–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
          />

          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
          <button className={styles.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>


      {/* ===== Main Stats Grid ===== */}
      <div className={styles.statsGrid}>
        {/* 1️⃣ User Pending Request */}
        <div className={styles.mainStatsCard}>
          <svg width="32" height="45" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.812 34.64L3.2 39.6C2.594 40.054 1.784 40.128 1.106 39.788C0.428 39.45 0 38.758 0 38V2C0 0.896 0.896 0 2 0H30C31.104 0 32 0.896 32 2V38C32 38.758 31.572 39.45 30.894 39.788C30.216 40.128 29.406 40.054 28.8 39.6L22.188 34.64L17.414 39.414C16.634 40.196 15.366 40.196 14.586 39.414L9.812 34.64ZM28 34V4H4V34L8.8 30.4C9.596 29.802 10.71 29.882 11.414 30.586L16 35.172L20.586 30.586C21.29 29.882 22.404 29.802 23.2 30.4L28 34ZM14 20H18C19.104 20 20 19.104 20 18C20 16.896 19.104 16 18 16H14C12.896 16 12 16.896 12 18C12 19.104 12.896 20 14 20ZM10 12H22C23.104 12 24 11.104 24 10C24 8.896 23.104 8 22 8H10C8.896 8 8 8.896 8 10C8 11.104 8.896 12 10 12Z"
              fill="#717579"
            />
          </svg>
          <div className={styles.mainCardContent}>
            <h3>₹0.00</h3>
            <p>User Pending Request</p>
          </div>
        </div>

        {/* 2️⃣ Total Deposit */}
        <div className={styles.mainStatsCard}>
          <svg width="58" height="58" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.812 48.64L11.2 53.6C10.594 54.054 9.78401 54.128 9.10602 53.788C8.42802 53.45 8.00002 52.758 8.00002 52V16C8.00002 14.896 8.89602 14 10 14H38C39.104 14 40 14.896 40 16V52C40 52.758 39.572 53.45 38.894 53.788C38.216 54.128 37.406 54.054 36.8 53.6L30.188 48.64L25.414 53.414C24.634 54.196 23.366 54.196 22.586 53.414L17.812 48.64ZM36 48V18H12V48L16.8 44.4C17.596 43.802 18.71 43.882 19.414 44.586L24 49.172L28.586 44.586C29.29 43.882 30.404 43.802 31.2 44.4L36 48ZM22 34H26C27.104 34 28 33.104 28 32C28 30.896 27.104 30 26 30H22C20.896 30 20 30.896 20 32C20 33.104 20.896 34 22 34ZM18 26H30C31.104 26 32 25.104 32 24C32 22.896 31.104 22 30 22H18C16.896 22 16 22.896 16 24C16 25.104 16.896 26 18 26Z"
              fill="#44814E"
            />
            <circle cx="43.5" cy="14.5" r="12.5" fill="#09BD3C" stroke="white" strokeWidth="4" />
          </svg>
          <div className={styles.mainCardContent}>
            <h3>₹0.00</h3>
            <p>Total Deposit</p>
          </div>
        </div>

        {/* 3️⃣ Total Withdrawals */}
        <div className={styles.mainStatsCard}>
          <svg width="58" height="58" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.812 48.64L11.2 53.6C10.594 54.054 9.78401 54.128 9.10602 53.788C8.42802 53.45 8.00002 52.758 8.00002 52V16C8.00002 14.896 8.89602 14 10 14H38C39.104 14 40 14.896 40 16V52C40 52.758 39.572 53.45 38.894 53.788C38.216 54.128 37.406 54.054 36.8 53.6L30.188 48.64L25.414 53.414C24.634 54.196 23.366 54.196 22.586 53.414L17.812 48.64ZM36 48V18H12V48L16.8 44.4C17.596 43.802 18.71 43.882 19.414 44.586L24 49.172L28.586 44.586C29.29 43.882 30.404 43.802 31.2 44.4L36 48ZM22 34H26C27.104 34 28 33.104 28 32C28 30.896 27.104 30 26 30H22C20.896 30 20 30.896 20 32C20 33.104 20.896 34 22 34ZM18 26H30C31.104 26 32 25.104 32 24C32 22.896 31.104 22 30 22H18C16.896 22 16 22.896 16 24C16 25.104 16.896 26 18 26Z"
              fill="#44814E"
            />
            <circle cx="43.5" cy="14.5" r="12.5" fill="#FD5353" stroke="white" strokeWidth="4" />
          </svg>
          <div className={styles.mainCardContent}>
            <h3>₹0.00</h3>
            <p>Total Withdrawals</p>
          </div>
        </div>

        {/* 4️⃣ Profit / Loss */}
        <div className={styles.mainStatsCard}>
          <svg width="58" height="58" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.812 48.64L11.2 53.6C10.594 54.054 9.78401 54.128 9.10602 53.788C8.42802 53.45 8.00002 52.758 8.00002 52V16C8.00002 14.896 8.89602 14 10 14H38C39.104 14 40 14.896 40 16V52C40 52.758 39.572 53.45 38.894 53.788C38.216 54.128 37.406 54.054 36.8 53.6L30.188 48.64L25.414 53.414C24.634 54.196 23.366 54.196 22.586 53.414L17.812 48.64ZM36 48V18H12V48L16.8 44.4C17.596 43.802 18.71 43.882 19.414 44.586L24 49.172L28.586 44.586C29.29 43.882 30.404 43.802 31.2 44.4L36 48ZM22 34H26C27.104 34 28 33.104 28 32C28 30.896 27.104 30 26 30H22C20.896 30 20 30.896 20 32C20 33.104 20.896 34 22 34ZM18 26H30C31.104 26 32 25.104 32 24C32 22.896 31.104 22 30 22H18C16.896 22 16 22.896 16 24C16 25.104 16.896 26 18 26Z"
              fill="#44814E"
            />
            <circle cx="43.5" cy="14.5" r="12.5" fill="#FFAA2B" stroke="white" strokeWidth="4" />
          </svg>
          <div className={styles.mainCardContent}>
            <h3>₹0.00</h3>
            <p>Profit / Loss</p>
          </div>
        </div>

        {/* ===== Extra Stats Cards ===== */}
       {/* ===== Extra Stats Cards ===== */}
<div className={`${styles.extraStatsCard} ${styles.bgOrange}`}>
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  <div className={styles.extraCardContent}>
    <p>Total Inprocess Request</p>
    <h3>₹0.00</h3>
  </div>
</div>

<div className={`${styles.extraStatsCard} ${styles.bgGrayDark}`}>
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke="#FFD600" strokeWidth="2" />
    <path d="M4 21C4 16.582 7.582 13 12 13C16.418 13 20 16.582 20 21" stroke="#FFD600" strokeWidth="2" />
  </svg>
  <div className={styles.extraCardContent}>
    <p>Suspicious Users Deposit</p>
    <h3>₹0.00</h3>
  </div>
</div>

<div className={`${styles.extraStatsCard} ${styles.bgGrayDark}`}>
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke="#FF6F61" strokeWidth="2" />
    <path d="M4 21C4 16.582 7.582 13 12 13C16.418 13 20 16.582 20 21" stroke="#FF6F61" strokeWidth="2" />
  </svg>
  <div className={styles.extraCardContent}>
    <p>Suspicious Users Withdrawal</p>
    <h3>₹0.00</h3>
  </div>
</div>

      </div>

     {/* ===== Users Section ===== */}
<div className={styles.usersCard}>
  <h3 className={styles.cardTitle}>Users</h3>

  <div className={`${styles.userRow}`}>
    <div className={`${styles.bar} ${styles.purpleBar}`}></div>
    <div>
      <span className={styles.label}>First Time Deposit User</span>
      <p className={styles.amount}>₹0.00</p>
    </div>
  </div>

  <div className={`${styles.userRow}`}>
    <div className={`${styles.bar} ${styles.tealBar}`}></div>
    <div>
      <span className={styles.label}>First Time Withdrawal User</span>
      <p className={styles.amount}>₹0.00</p>
    </div>
  </div>

  <div className={`${styles.userRow}`}>
    <div className={`${styles.bar} ${styles.deepPurpleBar}`}></div>
    <div>
      <span className={styles.label}>Total Users</span>
      <p className={styles.amount}>0</p>
    </div>
  </div>
</div>
    </div>
  );
};

export default Dashboard;


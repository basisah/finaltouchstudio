import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h2>Welcome to the Admin Area</h2>
          <p>
            You have successfully logged in. In the future, we can add the UI
            here to add, edit, and delete items from your database.
          </p>
        </div>
      </main>
    </div>
  );
}

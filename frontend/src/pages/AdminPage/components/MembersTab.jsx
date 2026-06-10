import React from "react";
import styles from "../AdminPage.module.css";

export default function MembersTab({
  members,
  handleToggleMemberStatus,
  handleAddMember,
  newMemName,
  setNewMemName,
  newMemEmail,
  setNewMemEmail,
  newMemPhone,
  setNewMemPhone,
}) {
  return (
    <div className={styles.categoryGrid}>
      {/* Member list Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Registered Members Directory ({members.length})</h2>
          <p>Overview of client profiles and loyalty membership status</p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Member Details</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Active Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((mem) => (
                <tr key={mem.id}>
                  <td>
                    <code>{mem.id}</code>
                  </td>
                  <td>
                    <strong>{mem.name}</strong>
                    <p className={styles.tableSmallDesc}>{mem.email}</p>
                  </td>
                  <td>{mem.phone}</td>
                  <td className={styles.dateCol}>{mem.joinDate}</td>
                  <td>
                    <div className={styles.availabilityToggle}>
                      <span
                        className={`${styles.statusLabel} ${mem.status === "Active" ? styles.statusAvailable : styles.statusBooked}`}
                      >
                        {mem.status}
                      </span>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={mem.status === "Active"}
                          onChange={() => handleToggleMemberStatus(mem.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>➕ Add New Member</h2>
          <p>Register a new client profile</p>
        </div>

        <form onSubmit={handleAddMember} className={styles.itemForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="memName">Full Name</label>
            <input
              id="memName"
              type="text"
              placeholder="e.g. Shamim Ahsan"
              value={newMemName}
              onChange={(e) => setNewMemName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="memEmail">Email Address</label>
            <input
              id="memEmail"
              type="email"
              placeholder="shamim@example.com"
              value={newMemEmail}
              onChange={(e) => setNewMemEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="memPhone">Phone Number</label>
            <input
              id="memPhone"
              type="text"
              placeholder="+880 17XX-XXXXXX"
              value={newMemPhone}
              onChange={(e) => setNewMemPhone(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.addItemBtn}>
            ✦ Register Member Account
          </button>
        </form>
      </div>
    </div>
  );
}

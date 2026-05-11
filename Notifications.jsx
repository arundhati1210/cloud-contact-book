import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsub();
  }, []);

  return (
    <div style={{
      background: "#ffffff",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      <h3>🔔 Notifications</h3>
      {notifications.length === 0 && <p>No notifications</p>}
      {notifications.map((n, i) => (
        <p key={i} style={{ fontSize: "14px" }}>• {n.message}</p>
      ))}
    </div>
  );
}

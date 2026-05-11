import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";

// ---- AuthForm Component ----
function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.authContainer}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={isLogin ? handleLogin : handleSignup} style={styles.button}>
        {isLogin ? "Login" : "Sign Up"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={styles.toggleText}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span style={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
}

// ---- Dashboard Component ----
function Dashboard({ user, handleLogout }) {
  const [contacts, setContacts] = useState([]);
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [showBin, setShowBin] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notification, setNotification] = useState("");

  // Real-time fetch contacts
  useEffect(() => {
    const contactsRef = collection(db, "contacts");
    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      const allContacts = [];
      const deleted = [];
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        if (data.deleted) {
          deleted.push(data);
        } else {
          allContacts.push(data);
        }
      });
      setContacts(allContacts);
      setDeletedContacts(deleted);
    });
    return () => unsubscribe();
  }, []);

  // Show temporary notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2000);
  };

  // Add new contact
  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) return;
    await addDoc(collection(db, "contacts"), {
      name,
      phone,
      deleted: false,
      favorite: false,
      userId: user.uid,
    });
    setName("");
    setPhone("");
    showNotification("Contact added!");
  };

  // Delete contact (soft delete)
  const handleDelete = async (contactId) => {
    const contactRef = doc(db, "contacts", contactId);
    await updateDoc(contactRef, { deleted: true });
    showNotification("Contact deleted!");
  };

  // Restore deleted contact
  const handleRestore = async (contactId) => {
    const contactRef = doc(db, "contacts", contactId);
    await updateDoc(contactRef, { deleted: false });
    showNotification("Contact restored!");
  };

  // Toggle favorite
  const handleFavorite = async (contactId, currentStatus) => {
    const contactRef = doc(db, "contacts", contactId);
    await updateDoc(contactRef, { favorite: !currentStatus });
    showNotification(currentStatus ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h2>Cloud Contact Book</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.toggleBin}>
        <button onClick={() => setShowBin(!showBin)} style={styles.button}>
          {showBin ? "Back to Contacts" : "View Recycle Bin"}
        </button>
      </div>

      {notification && <div style={styles.notification}>{notification}</div>}

      {!showBin ? (
        <>
          <div style={styles.addForm}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleAddContact} style={styles.button}>Add Contact</button>
          </div>

          <div style={styles.contactList}>
            {contacts.length === 0 ? (
              <p>No contacts available.</p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} style={styles.contactCard}>
                  <p><strong>{contact.name}</strong></p>
                  <p>{contact.phone}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button 
                      onClick={() => handleDelete(contact.id)} 
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => handleFavorite(contact.id, contact.favorite)} 
                      style={{ 
                        ...styles.button, 
                        background: contact.favorite ? "#FFD700" : "#2575fc",
                      }}
                    >
                      {contact.favorite ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={styles.contactList}>
          {deletedContacts.length === 0 ? (
            <p>Recycle Bin is empty.</p>
          ) : (
            deletedContacts.map((contact) => (
              <div key={contact.id} style={styles.contactCard}>
                <p><strong>{contact.name}</strong></p>
                <p>{contact.phone}</p>
                <button onClick={() => handleRestore(contact.id)} style={styles.restoreBtn}>
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={styles.appBackground}>
      {!user ? <AuthForm /> : <Dashboard user={user} handleLogout={handleLogout} />}
    </div>
  );
}

// ---- Styles ----
const styles = {
  appBackground: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #6a11cb, #2575fc)",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  authContainer: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    width: "350px",
    textAlign: "center",
  },
  input: {
    display: "block",
    width: "100%",
    margin: "10px 0",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    marginTop: "10px",
    width: "100%",
    border: "none",
    borderRadius: "5px",
    background: "#2575fc",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  toggleText: { marginTop: "15px", fontSize: "14px" },
  toggleLink: { color: "#2575fc", cursor: "pointer", textDecoration: "underline" },
  dashboardContainer: {
    maxWidth: "900px",
    width: "100%",
    background: "#f0f4f8",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoutBtn: {
    padding: "8px 16px",
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  toggleBin: { margin: "20px 0", textAlign: "center" },
  addForm: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  contactList: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" },
  contactCard: {
    padding: "15px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  deleteBtn: {
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#ff4d4f",
    color: "#fff",
    cursor: "pointer",
  },
  restoreBtn: {
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#52c41a",
    color: "#fff",
    cursor: "pointer",
  },
  notification: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#fff",
    background: "#2575fc",
    padding: "10px",
    borderRadius: "5px",
  },
};

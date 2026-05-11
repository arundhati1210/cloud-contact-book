import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const getDeletedContacts = (setDeletedContacts) => {
  const q = query(
    collection(db, "contacts"),
    where("isDeleted", "==", true)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setDeletedContacts(data);
  });
};

export default getDeletedContacts;

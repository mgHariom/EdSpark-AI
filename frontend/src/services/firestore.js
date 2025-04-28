// services/firestore.js
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveUserSearch(uid, searchQuery) {
  try {
    const docRef = await addDoc(collection(db, "users", uid, "searches"), {
      query: searchQuery,
      createdAt: serverTimestamp(),
    });
    console.log("Search saved with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding search:", e);
  }
}

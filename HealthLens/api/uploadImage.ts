import { storage, db } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

export const uploadImageToFirebase = async (uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `diagnoses/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    // 1️⃣ Upload to Storage
    await uploadBytes(storageRef, blob);

    // 2️⃣ Get public URL
    const downloadURL = await getDownloadURL(storageRef);

    // 3️⃣ Save metadata to Firestore
    const docRef = await addDoc(collection(db, "diagnoses"), {
      imageUrl: downloadURL,
      timestamp: Timestamp.now(),
      filename,
      analyzed: false,
    });

    return {
      success: true,
      downloadURL,
      docId: docRef.id,
    };
  } catch (error) {
    console.error("🔥 Firebase upload failed:", error);
    throw error; // ⬅️ IMPORTANT: fail hard so UI knows
  }
};

export const getImagesFromFirebase = async () => {
  const q = query(collection(db, "diagnoses"), orderBy("timestamp", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

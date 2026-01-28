import { storage, db } from "../HealthLens/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

export const uploadImageToFirebase = async (uri: string) => {
    try {
        /** Converting uri into blob. uri is the string the points to the location of where the picture is being stored.
         * Blob is the actual raw image data. This is done since firebase can't just use the uri. */ 
        const response = await fetch(uri);
        const blob = await response.blob();

        // Creating unique file name.
        const filename = `diagnoses/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        // Uploading to Firebase.
        await uploadBytes(storageRef, blob);

        // Getting download URL.
        const downloadURL = await getDownloadURL(storageRef);

        // Saving meta data to Firestore.
        const docRef = await addDoc(collection(db, 'diagnoses'), {
            imageURL: downloadURL,
            timestamp: new Date(),
            filename: filename,
            analyzed: false,
        });

        return {
            success: true,
            downloadURL,
            docId: docRef.id,
        };
    } catch (error) {
        console.error ('Error uploading image:', error);
        return {
            success: false,
            error: error,
        };
    }
};

export const getImagesFromFirebase = async () => {
    try{
        const q = query(collection(db, 'diagnoses'), orderBy('timestamp', 'desc'))
        const querySnapshot = await getDocs(q);

        const images = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return images;
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
};
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path in storage (e.g., 'products').
 * @returns The download URL of the uploaded image.
 */
export const uploadImage = async (file: File, path: string = "products"): Promise<string> => {
    try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const fileName = `${timestamp}_${safeName}`;
        const storageRef = ref(storage, `${path}/${fileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

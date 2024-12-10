import { useState, useEffect } from "react";
import photoGallery from "../utils/photoGallery";
import supabase from "./useSupabaseClient";

const useImageHandler = () => {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const { takePhoto, photo, uploadImageToStorage, blob, loading } = photoGallery();

  useEffect(() => {
    if (photo && photo.webViewPath) {
      setPhotoUrl(photo.webViewPath);
    }
  }, [photo]);

  const handleUpload = async (id: string = `${new Date().getTime()}`) => {
    if (!blob) {
      throw new Error("No photo blob available");
    }
    let fileName = `userImage-${id}.jpg`;

    const uploadResult = await uploadImageToStorage(
      "user-images",
      fileName,
      blob,
      blob.type
    );

    if (!uploadResult) {
      throw new Error("Failed to upload image");
    }

    const { data: publicData } = supabase.storage
      .from("user-images")
      .getPublicUrl(fileName);

    if (!publicData.publicUrl) {
      throw new Error("No public URL generated");
    }

    return { fileName, publicUrl: publicData.publicUrl };
  };

  const removeImage = async (fileName: string) => {
    const removedImage = await supabase.storage
      .from("user-images")
      .remove([fileName]);

    if (removedImage.error) {
      throw new Error(`Error removing image: ${removedImage.error.message}`);
    }

    return removedImage;
  };

  return {
    photoUrl,
    loading,
    takePhoto,
    handleUpload,
    removeImage,
  };
};

export default useImageHandler;

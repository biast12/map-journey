import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { isPlatform } from "@ionic/react";
import { useEffect, useState } from "react";
import Compressor from "compressorjs";
import useSupabaseClient from "../hooks/useSupabaseClient";
import useAuth from "../hooks/ProviderContext";
import * as nsfwjs from "nsfwjs";

interface UserPhoto {
  filePath: string;
  webViewPath?: string;
}

const PHOTO_PREF_REF = "photos";
const photoGallery = () => {
  const { role } = useAuth();

  const [photo, setPhoto] = useState<UserPhoto>();
  const [blob, setBlob] = useState<Blob>();

  useEffect(() => {
    if (photo !== undefined) {
      Preferences.set({
        key: PHOTO_PREF_REF,
        value: JSON.stringify(photo),
      });
    }
  }, [photo]);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    role === "admin" && console.log("takePhoto", photo);

    const imageUrl = photo.path || photo.webPath;
    const newPath = Capacitor.convertFileSrc(imageUrl!);

    return await compressPhoto(newPath);
  };

  const savePhoto = async (
    photo: Photo,
    fileName: string
  ): Promise<UserPhoto> => {
    let base64Data: string;

    if (isPlatform("hybrid")) {
      const file = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Data,
      });
      base64Data = file.data as string;
    } else {
      base64Data = await base64FromPath(photo.webPath!);
    }
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      directory: Directory.Data,
      data: base64Data,
    });

    if (isPlatform("hybrid")) {
      return {
        filePath: savedFile.uri,
        webViewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }

    return {
      filePath: fileName,
      webViewPath: photo.webPath,
    };
  };

  async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("method did not return a string");
        }
      };

      reader.readAsDataURL(blob);
    });
  }

  async function base64FromBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("method did not return a string");
        }
      };

      reader.readAsDataURL(blob);
    });
  }

  async function compressPhoto(path: any) {
    const response = await fetch(path);
    const blob = await response.blob();

    role === "admin" && console.log("uncompressed blob", blob);

    const time = new Date().getTime();
    const fileName = `userImage-${time}.jpg`;

    return new Promise((resolve, reject) => {
      new Compressor(blob, {
        quality: 0.1,
        convertTypes: ["image/jpeg", "image/png"],
        convertSize: 10000,
        success: async (compressedResult: Blob) => {
          role === "admin" && console.log("compressed blob", compressedResult);

          // Check for NSFW content
          const isNSFW = await checkForNSFW(compressedResult);
          if (isNSFW) {
            console.warn("NSFW content detected, blocking image.");
            reject("NSFW content detected");
            return;
          }

          const savedFileImage = await checkCompressedImage(
            fileName,
            compressedResult
          );
          resolve(savedFileImage);
        },
        error(err) {
          console.error("Compression error:", err);
          reject(err);
        },
      });
    });
  }

  async function checkForNSFW(imageBlob: Blob): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const model = await nsfwjs.load();
        const predictions = await model.classify(img);

        // Set a confidence threshold (70%)
        const threshold = 0.7;

        const isNSFW = predictions.some(
          (prediction) =>
            (prediction.className === "Porn" ||
              prediction.className === "Hentai" ||
              prediction.className === "Sexy") &&
            prediction.probability > threshold
        );
        resolve(isNSFW);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = URL.createObjectURL(imageBlob);
    });
  }

  async function checkCompressedImage(fileName: string, image: Blob) {
    role === "admin" && console.log("Blob", image);
    setBlob(image);
    const base64 = await base64FromBlob(image);
    role === "admin" && console.log("Base64", base64);
    const savedFileImage = await savePhoto(
      { webPath: base64 } as Photo,
      fileName
    );
    savedFileImage.webViewPath = base64;
    role === "admin" && console.log("savedFileImage", savedFileImage);
    setPhoto(savedFileImage);
    return savedFileImage;
  }

  async function uploadImageToStorage(
    toStorage: string,
    fileName: string,
    image: Blob,
    fileType: string
  ) {
    role === "admin" && console.log("upload image", image);

    const { data, error } = await useSupabaseClient.storage
      .from(toStorage)
      .upload(fileName, image, {
        cacheControl: "3600",
        contentType: fileType, // Ensure the correct MIME type is set
        upsert: true, // Do not overwrite the file if it exists
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    role === "admin" && console.log("Uploaded image:", data);
    return data;
  }

  const deletePhoto = async (fileName: string) => {};

  return {
    blob,
    photo,
    takePhoto,
    deletePhoto,
    uploadImageToStorage,
  };
};

export default photoGallery;

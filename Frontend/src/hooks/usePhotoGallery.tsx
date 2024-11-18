import {
    Camera,
    CameraResultType,
    CameraSource,
    Photo
} from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem'

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { isPlatform } from '@ionic/react'
import { useEffect, useState } from 'react'
import Compressor from 'compressorjs'
import useSupabaseClient from './useSupabaseClient'

export interface UserPhoto {
    filePath: string
    webViewPath?: string
}

const PHOTO_PREF_REF = 'photos'
export const usePhotoGallery = () => {
    const [photo, setPhoto] = useState<UserPhoto>()
    const [blob, setBlob] = useState<Blob>()

    useEffect(() => {
        if (photo !== undefined) {
            Preferences.set({
                key: PHOTO_PREF_REF,
                value: JSON.stringify(photo)
            })
        }
    }, [photo])

    const takePhoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        })

        console.log('takePhoto', photo)

        const imageUrl = photo.path || photo.webPath
        const newPath = Capacitor.convertFileSrc(imageUrl!)

        return await compressPhoto(newPath)
    }

    const savePhoto = async (
        photo: Photo,
        fileName: string
    ): Promise<UserPhoto> => {
        let base64Data: string

        if (isPlatform('hybrid')) {
            const file = await Filesystem.readFile({
                path: fileName,
                directory: Directory.Data
            })
            base64Data = file.data as string
        } else {
            base64Data = await base64FromPath(photo.webPath!)
        }
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            directory: Directory.Data,
            data: base64Data
        })

        if (isPlatform('hybrid')) {
            return {
                filePath: savedFile.uri,
                webViewPath: Capacitor.convertFileSrc(savedFile.uri)
            }
        }

        return {
            filePath: fileName,
            webViewPath: photo.webPath
        }
    }

    async function base64FromPath(path: string): Promise<string> {
        const response = await fetch(path)
        const blob = await response.blob()

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onerror = reject
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result)
                } else {
                    reject('method did not return a string')
                }
            }

            reader.readAsDataURL(blob)
        })
    }

    async function base64FromBlob(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onerror = reject
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result)
                } else {
                    reject('method did not return a string')
                }
            }

            reader.readAsDataURL(blob)
        })
    }

    async function compressPhoto(path: any) {
        const response = await fetch(path)
        const blob = await response.blob()

        console.log('uncompressed blob', blob)

        const time = new Date().getTime()
        const fileName = `userImage-${time}.jpg`

        return new Promise((resolve, reject) => {
            new Compressor(blob, {
                quality: 0.1,
                convertTypes: ['image/jpeg', 'image/png'],
                convertSize: 10000,
                success: async (compressedResult: Blob) => {
                    console.log('compressed blob', compressedResult)
                    const savedFileImage = await checkCompressedImage(fileName, compressedResult)
                    resolve(savedFileImage)
                },
                error(err) {
                    console.error('Compression error:', err)
                    reject(err)
                }
            })
        })
    }

    async function checkCompressedImage(
        fileName: string,
        image: Blob
    ) {
        console.log('Blob', image)
        setBlob(image)
        const base64 = await base64FromBlob(image)
        console.log('Base64', base64)
        const savedFileImage = await savePhoto({ webPath: base64 } as Photo, fileName)
        savedFileImage.webViewPath = base64
        console.log('savedFileImage', savedFileImage)
        setPhoto(savedFileImage)
        return savedFileImage
    }

    async function uploadImageToStorage(toStorage: string, fileName: string, image: Blob, fileType: string) {
        console.log('upload image', image)

        const { data, error } = await useSupabaseClient.storage
            .from(toStorage)
            .upload(fileName, image, {
                cacheControl: '3600',
                contentType: fileType, // Ensure the correct MIME type is set
            })

        if (error) {
            console.error('Error uploading image:', error)
            return null
        }

        console.log('Uploaded image:', data)
        return data
    }

    const deletePhoto = async (fileName: string) => { }

    return {
        blob,
        photo,
        takePhoto,
        deletePhoto,
        uploadImageToStorage
    }
}

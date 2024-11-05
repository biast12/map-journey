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

export interface UserPhoto {
	filePath: string
	webViewPath?: string
}

const PHOTO_PREF_REF = 'photos'
export const usePhotoGallery = () => {
	const [photo, setPhoto] = useState<UserPhoto>()

    useEffect(() => {
        const loadSaved = async () => {
            const { value } = await Preferences.get({ key: PHOTO_PREF_REF })
            const photoInPrefs: UserPhoto = (value ? JSON.parse(value) : null);

            if (!isPlatform('hybrid')) {
                    const file = await Filesystem.readFile({
                        path: photoInPrefs.filePath,
                        directory: Directory.Data
                    })
                    photoInPrefs.webViewPath = `data:image/jpeg;base64,${file.data}`
            }

            setPhoto(photoInPrefs)
        }
    }, [])

    useEffect(() => {
        if (photo !== undefined) {
            Preferences.set({ key: PHOTO_PREF_REF, value: JSON.stringify(photo) })
        }
    }, [photo])

	const takePhoto = async () => {
		const photo = await Camera.getPhoto({
			resultType: CameraResultType.Uri,
			source: CameraSource.Camera,
			quality: 100
		})

		console.log('takePhoto', photo)

		const fileName = new Date().getTime() + '.jpeg'
        const savedFileImage = await savePhoto(photo, fileName)
        setPhoto(savedFileImage)
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

	const deletePhoto = async (fileName: string) => {}

	return {
		photo,
		takePhoto,
		deletePhoto
	}
}

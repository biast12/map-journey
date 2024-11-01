import {
	Camera,
	CameraResultType,
	CameraSource,
	Photo
} from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { useEffect, useState } from 'react'

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { isPlatform } from '@ionic/react'

export interface UserPhoto {
	filepath: string
	webviewPath?: string
}

export function usePhotoGallery() {
	const takePhoto = async () => {
		const photo = await Camera.getPhoto({
			resultType: CameraResultType.Uri,
			source: CameraSource.Camera,
			quality: 100
		})

        return photo
	}

	return {
		takePhoto
	}
}

import './MakePinModal.scss'

import {
	IonButton,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonIcon,
	IonImg,
	IonInput,
	IonItem,
	IonTextarea
} from '@ionic/react'
import { UserPhoto, usePhotoGallery } from '../hooks/usePhotoGallery'
import { add, camera, close, image, locationSharp } from 'ionicons/icons'
import { useEffect, useState } from 'react'

function MakePinModal() {
	const [expanded, setExpanded] = useState(false)
	const [photos, setPhotos] = useState<UserPhoto[]>([])
	const [photo, setPhoto] = useState<any>()
	const { takePhoto } = usePhotoGallery()

	const insertLocation = (): void => {
		console.log('insertLocation')
	}

	const toggleExpand = (): void => {
		setExpanded(!expanded)
	}

	useEffect(() => {
		if (photo) {
			console.log(photo)
			const fileName = Date.now() + '.jpeg'
			const newPhotos = [
				{
					filepath: fileName,
					webviewPath: photo.webPath
				},
				...photos
			]
			setPhotos(newPhotos)
		}
	}, [photo])

	return (
		<IonCard>
			<IonCardHeader>
				<IonCardTitle>Map your Journey</IonCardTitle>
			</IonCardHeader>
			<IonItem>
				<IonInput
					label='Title:'
					placeholder='Your title here'></IonInput>
			</IonItem>
			<img
				src={
					photo
						? photo.webviewPath
						: 'https://ionicframework.com/docs/img/demos/card-media.png'
				}
				alt={photo ? 'Photo taken by user' : 'Silhouette of mountains'}
			/>
			<div className='addimagebutton'>
				<IonButton
					size='large'
					className='fade-in'
					onClick={() => {
						setPhoto(takePhoto)
					}}>
					<IonIcon icon={camera} />
				</IonButton>
				<IonButton size='large' className='fade-in'>
					<IonIcon icon={image} />
				</IonButton>
			</div>

			<IonItem>
				<IonInput
					label='Location:'
					placeholder='Input address here'></IonInput>
				<IonButton aria-label='Location' onClick={insertLocation}>
					<IonIcon icon={locationSharp}></IonIcon>
				</IonButton>
			</IonItem>
			<IonItem>
				<IonTextarea
					label='Comments:'
					placeholder='Type something here'></IonTextarea>
			</IonItem>
			<div id='confirmButton'>
				<IonButton>Confirm</IonButton>
			</div>
		</IonCard>
	)
}

export default MakePinModal

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
import { camera, image, locationSharp } from 'ionicons/icons'
import { useEffect, useState, useRef } from 'react'

import { usePhotoGallery } from './../hooks/usePhotoGallery'

function MakePinModal() {
	const [photoUrl, setPhotoUrl] = useState<string>()
	const { takePhoto, photo } = usePhotoGallery()
	const fileInputRef = useRef<HTMLInputElement>(null)

	function handleConfirm() {
		console.log('handleConfirm')
		if (photoUrl) {
			// Remove the photos from saved state
			setPhotoUrl(undefined)
		}
	}

	const insertLocation = (): void => {
		console.log('insertLocation')
	}

	useEffect(() => {
		if (photo && photo.webViewPath) {
			console.log(photoUrl)
			setPhotoUrl(photo.webViewPath)
		}
	}, [photo])

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files
		if (files) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i]
				const reader = new FileReader()
				reader.onloadend = () => {
					setPhotoUrl(reader.result as string)
				}
				reader.readAsDataURL(file)
			}
		}
	}

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
			{photoUrl ? (
				<IonImg src={photoUrl} alt={`User Photo`} />
			) : (
				<IonImg
					src={
						'https://ionicframework.com/docs/img/demos/card-media.png'
					}
					alt={'Silhouette of mountains'}
				/>
			)}
			<div className='add-image-button'>
				<IonButton
					size='large'
					className='fade-in'
					aria-label='Take Photo'
					onClick={async () => {
						await takePhoto()
					}}>
					<IonIcon icon={camera} aria-hidden='true' />
				</IonButton>
				<IonButton
					size='large'
					className='fade-in'
					aria-label='Add Image'
					onClick={() => fileInputRef.current?.click()}>
					<IonIcon icon={image} aria-hidden='true' />
				</IonButton>
				<input
					type='file'
					ref={fileInputRef}
					style={{ display: 'none' }}
					aria-hidden='true'
					onChange={handleFileChange}
					accept='image/*'
				/>
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
				<IonButton onClick={handleConfirm}>Confirm</IonButton>
			</div>
		</IonCard>
	)
}

export default MakePinModal

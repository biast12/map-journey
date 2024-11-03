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
import { add, camera, close, image, locationSharp } from 'ionicons/icons'
import { useEffect, useState, useRef } from 'react'

import { usePhotoGallery, UserPhoto } from './../hooks/usePhotoGallery'

function MakePinModal() {
	const [photoUrls, setPhotoUrls] = useState<string[]>([])
	const { takePhoto, photo } = usePhotoGallery()
	const fileInputRef = useRef<HTMLInputElement>(null)

	function handleConfirm() {
		console.log('handleConfirm')
		if (photoUrls.length > 0) {
			// Remove the photos from saved state
			setPhotoUrls([])
		}
	}

	const insertLocation = (): void => {
		console.log('insertLocation')
	}

	useEffect(() => {
		if (photo && photo.webViewPath) {
			console.log(photoUrls.length)
			if (photoUrls.length < 5) {
				setPhotoUrls(prevUrls => [...prevUrls, photo.webViewPath!])
			}
		}
	}, [photo])

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files
		if (files) {
			const newPhotoUrls = []
			for (let i = 0; i < files.length; i++) {
				if (photoUrls.length < 5) {
					const file = files[i]
					const reader = new FileReader()
					reader.onloadend = () => {
						setPhotoUrls(prevUrls => [
							...prevUrls,
							reader.result as string
						])
					}
					reader.readAsDataURL(file)
				}
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
			{photoUrls.map((url, index) => (
				<img key={index} src={url} alt={`Photo ${index + 1}`} />
			))}
			<div className='addimagebutton'>
				<IonButton
					size='large'
					className='fade-in'
					onClick={async () => {
						await takePhoto()
					}}>
					<IonIcon icon={camera} />
				</IonButton>
				<IonButton
					size='large'
					className='fade-in'
					onClick={() => fileInputRef.current?.click()}>
					<IonIcon icon={image} />
				</IonButton>
				<input
					type='file'
					ref={fileInputRef}
					style={{ display: 'none' }}
					onChange={handleFileChange}
					multiple
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

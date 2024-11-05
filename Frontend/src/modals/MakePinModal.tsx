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
import { Geolocation } from '@capacitor/geolocation'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import { useEffect, useState, useRef } from 'react'
import { usePhotoGallery } from './../hooks/usePhotoGallery'
import { toFormData } from 'axios'
const debug = true // Set this to false to disable logging
function MakePinModal() {
	const [title, setTitle] = useState<string>()
	const [photoUrl, setPhotoUrl] = useState<string>()
	const [location, setLocation] = useState<any>()
	const [coordinates, setCoordinates] = useState<Coordinate>()
	const [comment, setComment] = useState<string>()
	const { takePhoto, photo } = usePhotoGallery()
	const fileInputRef = useRef<HTMLInputElement>(null)

	function handleConfirm() {
		const formData = toFormData({
			title: title,
			description: comment,
			location: location.address,
			latitude: location.lat,
			longitude: location.lon,
			imgurls: [photoUrl]
		})
		if (debug) {
			console.log('handleConfirm')
			console.log(
				title,
				comment,
				location.address,
				location.lat,
				location.lon,
				photoUrl
			)
		}
		if (photoUrl) {
			// Remove the photos from saved state
			//setPhotoUrl(undefined)
		}
	}

	function updateTitle(event: any) {
		console.log(event.detail.value)
		setTitle(event.detail.value)
	}

	function updateComment(event: any) {
		console.log(event.detail.value)
		setComment(event.detail.value)
	}

	async function getLocation(useCurrentLocation: boolean = true) {
		if (!useCurrentLocation) return
		const position = await Geolocation.getCurrentPosition()
		const { latitude, longitude } = position.coords
		const coordinates = fromLonLat([longitude, latitude])
		const location = await fetch(
			`https://nominatim.openstreetmap.org/reverse.php?lat=${latitude}&lon=${longitude}&format=jsonv2`
		)
		const locationData = await location.json()
		let address = ''
		if (locationData.address.road) {
			address += locationData.address.road
		}
		if (locationData.address.house_number) {
			address += ` ${locationData.address.house_number}`
		}
		if (locationData.address.city) {
			address += `, ${locationData.address.city}`
		}
		if (locationData.address.town) {
			address += `, ${locationData.address.town}`
		}
		if (locationData.address.postcode) {
			address += `, ${locationData.address.postcode}`
		}
		if (locationData.address.state) {
			address += `, ${locationData.address.state}`
		}
		if (locationData.address.country) {
			address += `, ${locationData.address.country}`
		}
		if (debug) {
			console.log(`Latitude: ${latitude}, Longitude: ${longitude}`)
			console.log(address)
			console.log(locationData)
			console.log('useCurrentLocation')
		}
		address = address.replace(/undefined/g, '')
		setCoordinates(coordinates)
		setLocation({ address: address, lat: latitude, lon: longitude })
	}

	useEffect(() => {
		if (photo && photo.webViewPath) {
			console.log(photoUrl)
			setPhotoUrl(photo.webViewPath)
		}
	}, [photo])

	useEffect(() => {
		getLocation(true)
	}, [])

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
					onIonChange={updateTitle}
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
					disabled
					value={location?.address}
					label='Location:'
					placeholder='Input address here'></IonInput>
				<IonButton
					aria-label='Location'
					onClick={() => getLocation(true)}>
					<IonIcon icon={locationSharp}></IonIcon>
				</IonButton>
			</IonItem>
			<IonItem>
				<IonTextarea
					onIonChange={updateComment}
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

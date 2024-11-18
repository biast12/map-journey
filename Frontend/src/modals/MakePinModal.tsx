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
import supabase from '../hooks/useSupabaseClient'
import useRequestData from '../hooks/useRequestData'
import useAuth from '../hooks/ProviderContext'
const debug = true // Set this to false to disable logging
function MakePinModal({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState<string>()
    const [photoUrl, setPhotoUrl] = useState<string>()
    const [location, setLocation] = useState<any>()
    const [coordinates, setCoordinates] = useState<Coordinate>()
    const [comment, setComment] = useState<string>()
    const confirmButton = useRef<HTMLIonButtonElement>(null)
    const cancelButton = useRef<HTMLIonButtonElement>(null)
    const titleInput = useRef<HTMLIonInputElement>(null)
    const commentInput = useRef<HTMLIonTextareaElement>(null)
    const cameraButton = useRef<HTMLIonButtonElement>(null)
    const locationButton = useRef<HTMLIonButtonElement>(null)
    const locationInput = useRef<HTMLIonInputElement>(null)
    const { takePhoto, photo, uploadImageToStorage, blob }: any = usePhotoGallery()
    const { makeRequest, error: requestError } = useRequestData()
    const { userID } = useAuth()

    async function handleConfirm() {
        if (!title) {
            console.error('No title provided')
            return
        }

        if (!photo) {
            console.error('No photo to upload')
            return
        }

        if (!comment) {
            console.error('No comment provided')
            return
        }

        if (!location) {
            console.error('No location provided')
            return
        }

        if (!coordinates) {
            console.error('No coordinates provided')
            return
        }

        // Disable all inputs and buttons
        if (titleInput.current) titleInput.current.disabled = true
        if (commentInput.current) commentInput.current.disabled = true
        if (cameraButton.current) cameraButton.current.disabled = true
        if (locationButton.current) locationButton.current.disabled = true
        if (locationInput.current) locationInput.current.disabled = true
        if (confirmButton.current) confirmButton.current.disabled = true
        if (cancelButton.current) cancelButton.current.disabled = true

        const time = new Date().getTime()
        const fileName = `userImage-${time}.jpg`
        console.log('Detected MIME type:', blob?.type)
        const uploadResult = await uploadImageToStorage('user-images', fileName, blob, blob?.type as string).catch((error: any) => {
            console.error('Error uploading image:', error)
            return undefined
        })

        if (!uploadResult) {
            console.error('Failed to upload image')
            return
        }

        const { data: publicData } = supabase.storage
            .from('user-images')
            .getPublicUrl(fileName)

        if (!publicData.publicUrl) {
            console.error('No public URL generated')
            return
        }

        const formData = toFormData({
            title: title,
            description: comment,
            location: location.address,
            latitude: location.lat,
            longitude: location.lon,
            imgurls: publicData.publicUrl
        })

        console.log('handleConfirm')
        console.log('uploadedDataPublic', publicData)
        console.log('title', title)
        console.log('comment', comment)
        console.log('location', location.address)
        console.log('latitude', location.lat)
        console.log('longitude', location.lon)
        console.log('imgurls', publicData.publicUrl)

        // Perform any additional actions with formData, such as sending it to your backend
        const requestResult = await makeRequest(`pins/${0}`, 'POST', undefined, formData)

        if (requestError) {
            console.error('Error uploading pin:', requestError)
            console.log(`Removing image (${fileName}) from storage`)
            const removedImage = await supabase.storage.from('user-images').remove([fileName])
            if (removedImage.error) {
                console.error('Error removing image:', removedImage.error)
            } else if (removedImage.data.length === 0) {
                console.log('Removed 0 images')
            } else {
                console.log('Image removed successfully')
                console.log('removedImage', removedImage)
            }
            // Enable all inputs and buttons
            if (titleInput.current) titleInput.current.disabled = false
            if (commentInput.current) commentInput.current.disabled = false
            if (cameraButton.current) cameraButton.current.disabled = false
            if (locationButton.current) locationButton.current.disabled = false
            if (locationInput.current) locationInput.current.disabled = false
            if (confirmButton.current) confirmButton.current.disabled = false
            if (cancelButton.current) cancelButton.current.disabled = false
            return
        } else {
            console.log('Pin uploaded successfully')
            onClose()
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

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>Map your Journey</IonCardTitle>
            </IonCardHeader>
            <IonItem>
                <IonInput
                    onIonChange={updateTitle}
                    ref={titleInput}
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
                <IonButton ref={cameraButton}
                    size='large'
                    className='fade-in'
                    aria-label='Take Photo'
                    onClick={async () => {
                        const takenPhoto = await takePhoto()
                        const time = new Date().getTime()
                        const fileName = `userImage-${time}.jpg`
                    }}>
                    <IonIcon icon={camera} aria-hidden='true' />
                </IonButton>
            </div>

            <IonItem>
                <IonInput
                    disabled
                    ref={locationInput}
                    value={location?.address}
                    label='Location:'
                    placeholder='Input address here'></IonInput>
                <IonButton ref={locationButton}
                    aria-label='Location'
                    onClick={() => getLocation(true)}>
                    <IonIcon icon={locationSharp}></IonIcon>
                </IonButton>
            </IonItem>
            <IonItem>
                <IonTextarea ref={commentInput}
                    onIonChange={updateComment}
                    label='Comments:'
                    placeholder='Type something here'></IonTextarea>
            </IonItem>
            <div id='confirmButton'>
                <IonButton onClick={handleConfirm} ref={confirmButton}>Confirm</IonButton>
            </div>
        </IonCard>
    )
}

export default MakePinModal

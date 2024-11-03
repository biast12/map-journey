import App from './App'
import { AuthProvider } from './hooks/AuthContext'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { defineCustomElements } from '@ionic/pwa-elements/loader'

defineCustomElements(window)
const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
	<AuthProvider>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</AuthProvider>
)

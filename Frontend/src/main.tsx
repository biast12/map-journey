import App from './App'
import { ProviderContextProvider } from './hooks/ProviderContext'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { defineCustomElements } from '@ionic/pwa-elements/loader'

defineCustomElements(window)
const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
	<ProviderContextProvider>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</ProviderContextProvider>
)

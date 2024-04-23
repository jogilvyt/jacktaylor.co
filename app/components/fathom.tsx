import { useLocation } from '@remix-run/react'
import { load, trackPageview } from 'fathom-client'
import { useEffect } from 'react'

export function Fathom() {
	const location = useLocation()

	useEffect(() => {
		load('ERTYDPDJ', {
			includedDomains: ['jacktaylor.co'],
		})
	}, [])

	useEffect(() => {
		trackPageview()
	}, [location.pathname, location.search])

	return null
}

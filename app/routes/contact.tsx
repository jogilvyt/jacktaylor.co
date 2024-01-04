import { type MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Contact me | Jack Taylor' }]

export default function ContactRoute() {
	return <main>Contact page</main>
}

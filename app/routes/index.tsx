import { type MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Jack Taylor' }]

export default function Index() {
	return <main>Home page</main>
}

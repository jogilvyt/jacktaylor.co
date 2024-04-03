import { type MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => [
	{
		title: 'About me | Jack Taylor',
		description: 'Learn more about Jack Taylor.',
	},
]

export default function AboutRoute() {
	return <>About page</>
}

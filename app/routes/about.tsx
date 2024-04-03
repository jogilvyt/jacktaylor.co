import { type MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => [
	{
		title: 'About me | Jack Taylor',
	},
	{ name: 'description', content: 'Learn more about Jack Taylor.' },
]

export default function AboutRoute() {
	return <>About page</>
}

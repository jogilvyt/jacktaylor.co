import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { type MetaFunction } from '@remix-run/react'
import { generateSEOMetaTags } from '#app/utils/seo.ts'

export const loader = ({ request }: LoaderFunctionArgs) => {
	return json({ ogUrl: request.url })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return generateSEOMetaTags({
		title: 'About me',
		description:
			'Software engineer, music nerd, dog lover. Find out more about me.',
		url: data?.ogUrl ?? '',
	})
}

export default function AboutRoute() {
	return <>About page</>
}

import { type MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Blog posts | Jack Taylor' }]

export default function BlogPostsRoute() {
	return <main>Blog listing page</main>
}

import { json } from '@remix-run/node'
import { useLoaderData, type MetaFunction, Link } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'

export async function loader() {
	const posts = await prisma.post.findMany({
		orderBy: { updatedAt: 'desc' },
		take: 20,
		select: {
			id: true,
			updatedAt: true,
			slug: true,
			postMeta: {
				select: {
					title: true,
					description: true,
				},
			},
		},
	})

	return json({ posts })
}

export const meta: MetaFunction = () => [{ title: 'Blog posts | Jack Taylor' }]

export default function BlogPostsRoute() {
	const data = useLoaderData<typeof loader>()

	return (
		<main>
			{data.posts.map(post => (
				<Link to={post.slug} key={post.id}>
					{post.postMeta?.title}
				</Link>
			))}
		</main>
	)
}

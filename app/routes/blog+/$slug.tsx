import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getMDXComponent } from 'mdx-bundler/client'
import * as React from 'react'
import { prisma } from '#app/utils/db.server'
import { getMdxPage } from '#app/utils/mdx.server'

export async function loader({ params }: LoaderFunctionArgs) {
	const post = await prisma.post.findUnique({
		where: { slug: params.slug },
		select: {
			content: true,
			postMeta: {
				select: {
					title: true,
					description: true,
				},
			},
		},
	})

	if (!post) {
		throw new Response('Not found', { status: 404 })
	}

	const content = await getMdxPage(post.content)

	return json({ ...post, content })
}

export default function BlogPostRoute() {
	const data = useLoaderData<typeof loader>()
	const Component = React.useMemo(() => {
		return getMDXComponent(data.content)
	}, [data.content])

	return (
		<main>
			<h1>{data.postMeta?.title}</h1>
			<Component />
		</main>
	)
}

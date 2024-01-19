import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getMDXComponent } from 'mdx-bundler/client/index.js'
import * as React from 'react'
import { LazyImage } from '#app/components/lazy-image'
import { prisma } from '#app/utils/db.server'
import { getMdxPage } from '#app/utils/mdx.server'

export async function loader({ params }: LoaderFunctionArgs) {
	const post = await prisma.post.findUnique({
		where: { slug: params.slug },
		select: {
			content: true,
			image: {
				select: {
					id: true,
					dataUri: true,
				},
			},
			postMeta: {
				select: {
					title: true,
					description: true,
					imageAlt: true,
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
			{data.image?.id ? (
				<LazyImage
					dataUri={data.image?.dataUri}
					imageId={data.image?.id ?? ''}
					alt={data.postMeta?.imageAlt ?? ''}
					width={1000}
					height={600}
				/>
			) : null}
			<Component />
		</main>
	)
}

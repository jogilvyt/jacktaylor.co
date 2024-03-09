import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { LazyImage } from '#app/components/lazy-image'
import { prisma } from '#app/utils/db.server'
import { useMdxComponent } from '#app/utils/mdx'
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
	const Component = useMdxComponent({ content: data.content })

	return (
		<main>
			<h1>{data.postMeta?.title}</h1>
			{data.image?.id ? (
				<LazyImage
					dataUri={data.image?.dataUri}
					imageUrl={`/resources/post-image/${data.image?.id ?? ''}`}
					alt={data.postMeta?.imageAlt ?? ''}
					width={1000}
					height={600}
				/>
			) : null}
			<Component />
		</main>
	)
}

import { parse } from '@conform-to/zod'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import {
	useLoaderData,
	type MetaFunction,
	Form,
	useSearchParams,
} from '@remix-run/react'
import { z } from 'zod'
import { BlogCard } from '#app/components/blog-card'
import { Hero } from '#app/components/hero'
import { LazyImage } from '#app/components/lazy-image'
import { ToggleGroup, ToggleGroupItem } from '#app/components/ui/toggle-group'
import { prisma } from '#app/utils/db.server'
import { ConverkitSignupForm } from '../_converkit+/signup-form'

const filterSchema = z.object({
	categories: z.array(z.string()).nullish(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const filters = parse(url.searchParams, { schema: filterSchema })

	const getPosts = prisma.post.findMany({
		orderBy: {
			postMeta: {
				date: 'desc',
			},
		},
		where: {
			postMeta: {
				AND: filters.value?.categories?.map(category => ({
					categories: {
						some: {
							name: category,
						},
					},
				})),
			},
		},
		select: {
			id: true,
			updatedAt: true,
			slug: true,
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
					date: true,
				},
			},
		},
	})

	const getCategories = prisma.category.findMany({
		select: {
			id: true,
			name: true,
			posts: {
				where: {
					post: {
						postMeta: {
							AND: filters.value?.categories?.map(category => ({
								categories: {
									some: {
										name: category,
									},
								},
							})),
						},
					},
				},
				select: {
					_count: true,
				},
			},
		},
	})

	const [posts, categories] = await Promise.all([getPosts, getCategories])

	return json({ posts, categories })
}

export const meta: MetaFunction = () => [
	{
		title: 'Blog posts | Jack Taylor',
	},
	{ name: 'description', content: 'Helpful content for software engineers.' },
]

export default function BlogPostsRoute() {
	const [searchParams, setSearchParams] = useSearchParams()
	const data = useLoaderData<typeof loader>()

	return (
		<>
			<Hero
				title="Helpful content for software engineers."
				image={
					<LazyImage
						width={670}
						height={320}
						imageUrl="/images/laptop.jpg"
						dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAAAAAXCAcSKCIRPDUlRj44RDxANCw4DgEhIRgkMSYgST0nW09BYlhZXFRiSkJVLiIzLSAoPi8mWUkza15TcWduaGJ3VE5nOSs8JhUjOyojWEc1al1Xbmd0ZGJ8T01pNSY5CgAYKRYZSDosWlBOXFpoUVZwPUBeJBAvAAAQCAAMMCQaPzs3QURONj9WIypIAwAiAAASAAAGEQgAIiMKIyslGSUwAQ0sAAAYAAAUAAAGAAAADxUAERwABhURAAAZAAAU"
						alt=""
						className="hidden w-full rounded-3xl md:block"
					/>
				}
				condensed
			/>
			<section className="container pb-12 md:pb-24">
				<div className="mb-12">
					<h2 className="mb-4">Filter by category</h2>
					<Form preventScrollReset>
						<ToggleGroup
							type="multiple"
							defaultValue={searchParams.getAll('categories')}
							onValueChange={values => {
								const newParams = new URLSearchParams(searchParams)
								newParams.delete('categories')
								for (const value of values) {
									newParams.append('categories', value)
								}
								setSearchParams(newParams, { preventScrollReset: true })
							}}
							size="lg"
							className="flex flex-wrap justify-start gap-2"
						>
							{data.categories.map(category => (
								<ToggleGroupItem
									key={category.id}
									value={category.name}
									disabled={category.posts.length === 0}
									size="lg"
								>
									{category.name}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</Form>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{data.posts.map(post => (
						<BlogCard
							key={post.id}
							id={post.id}
							image={{
								id: post.image?.id,
								dataUri: post.image?.dataUri,
								alt: post.postMeta?.imageAlt,
							}}
							slug={post.slug}
							date={post.postMeta?.date}
							title={post.postMeta?.title}
							description={post.postMeta?.description}
						/>
					))}
				</div>
			</section>
			<ConverkitSignupForm title="Get helpful content like this straight to your inbox" />
		</>
	)
}

import { parse } from '@conform-to/zod'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import {
	useLoaderData,
	type MetaFunction,
	Link,
	Form,
	useSearchParams,
} from '@remix-run/react'
import { z } from 'zod'
import { Badge } from '#app/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '#app/components/ui/toggle-group'
import { prisma } from '#app/utils/db.server'

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
			postMeta: {
				select: {
					title: true,
					description: true,
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

export const meta: MetaFunction = () => [{ title: 'Blog posts | Jack Taylor' }]

export default function BlogPostsRoute() {
	const [searchParams, setSearchParams] = useSearchParams()
	const data = useLoaderData<typeof loader>()

	return (
		<main>
			<h1>Blog posts</h1>
			<Form>
				<ToggleGroup
					type="multiple"
					defaultValue={searchParams.getAll('categories')}
					onValueChange={values => {
						const newParams = new URLSearchParams(searchParams)
						newParams.delete('categories')
						for (const value of values) {
							newParams.append('categories', value)
						}
						setSearchParams(newParams)
					}}
				>
					{data.categories.map(category => (
						<ToggleGroupItem
							key={category.id}
							value={category.name}
							disabled={category.posts.length === 0}
						>
							{category.name}{' '}
							<Badge variant="outline">{category.posts.length}</Badge>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</Form>
			<ul>
				{data.posts.map(post => (
					<li key={post.id}>
						<Link to={post.slug}>{post.postMeta?.title}</Link>
					</li>
				))}
			</ul>
		</main>
	)
}

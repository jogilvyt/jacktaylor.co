import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	type MetaFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	unstable_useViewTransitionState,
	useLoaderData,
	useNavigation,
	useParams,
} from '@remix-run/react'
import clsx from 'clsx'
import { format } from 'date-fns'
import * as React from 'react'
import { BlogCard } from '#app/components/blog-card'
import { Callout } from '#app/components/callout'
import { LazyImage } from '#app/components/lazy-image'
import { ExternalLink } from '#app/components/text-link'
import { Link } from '#app/components/transition-links'
import { Icon } from '#app/components/ui/icon'
import { prisma } from '#app/utils/db.server'
import { useMdxComponent } from '#app/utils/mdx'
import { calculateReadingTime, getMdxPage } from '#app/utils/mdx.server'
import { cn } from '#app/utils/misc'
import { generateSEOMetaTags } from '#app/utils/seo'
import { ConverkitSignupForm } from '../_converkit+/signup-form'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const ogUrl = request.url
	const post = await prisma.post.findUnique({
		where: { slug: params.slug },
		select: {
			id: true,
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
					date: true,
					categories: true,
				},
			},
		},
	})

	if (!post) {
		throw new Response('Not found', { status: 404 })
	}

	const relatedPosts = await prisma.post.findMany({
		select: {
			id: true,
			slug: true,
			postMeta: {
				select: {
					date: true,
					title: true,
					description: true,
					imageAlt: true,
				},
			},
			image: {
				select: {
					id: true,
					dataUri: true,
				},
			},
		},
		where: {
			id: {
				not: post.id,
			},
			postMeta: {
				categories: {
					some: {
						id: {
							in: post.postMeta?.categories.map(category => category.id),
						},
					},
				},
			},
		},
		take: 3,
	})

	if (relatedPosts.length < 3) {
		const additionalPosts = await prisma.post.findMany({
			select: {
				id: true,
				slug: true,
				postMeta: {
					select: {
						date: true,
						title: true,
						description: true,
						imageAlt: true,
					},
				},
				image: {
					select: {
						id: true,
						dataUri: true,
					},
				},
			},
			where: {
				id: {
					notIn: [...relatedPosts.map(post => post.id), post.id],
				},
			},
			take: 3 - relatedPosts.length,
		})

		relatedPosts.push(...additionalPosts)
	}

	const content = await getMdxPage(post.content)
	const readingTime = calculateReadingTime(post.content)

	return json({ ...post, content, readingTime, relatedPosts, ogUrl })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return generateSEOMetaTags({
		title: data?.postMeta?.title,
		description: data?.postMeta?.description ?? undefined,
		url: data?.ogUrl ?? '',
	})
}

export const handle: SEOHandle = {
	getSitemapEntries: async request => {
		const blogs = await prisma.post.findMany({
			select: {
				slug: true,
			},
		})
		return blogs.map(blog => {
			return { route: `/blog/${blog.slug}`, priority: 0.7 }
		})
	},
}

export default function BlogPostRoute() {
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const isTransitioning = unstable_useViewTransitionState(
		`/blog/${params.slug}`,
	)
	const Component = useMdxComponent({ content: data.content })

	const navigation = useNavigation()

	let enableTransition = false

	// if the user is navigating back to the homepage, or to another blog post, disable the transition
	if (
		navigation?.location?.pathname !== '/' &&
		!navigation?.location?.pathname.includes('/blog/')
	) {
		enableTransition = true
	}

	const setTransitionClassname = isTransitioning && enableTransition

	const windowRef = React.useRef<Window | null>(null)

	React.useEffect(() => {
		windowRef.current = window
	}, [])

	return (
		<>
			<div className="container-narrow">
				<div className="py-12">
					<Link
						to="/blog"
						className="inline-flex items-center rounded-md text-xl ring-offset-background transition-all hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<Icon name="arrow-left" size="lg" className="mr-2" /> Back to blog
					</Link>
				</div>
				{data.image?.id ? (
					<LazyImage
						dataUri={data.image?.dataUri}
						imageUrl={`/resources/post-image/${data.image?.id ?? ''}`}
						alt={data.postMeta?.imageAlt ?? ''}
						width={982}
						height={600}
						className={cn('max-h-[320px] w-fit rounded-3xl md:max-h-none', {
							'blog-card-image-transition': setTransitionClassname,
						})}
					/>
				) : null}
				<article className="py-6">
					<div className="prose mx-auto max-w-[820px] dark:prose-invert lg:prose-xl prose-headings:font-medium">
						<span
							className={cn(
								'not-prose mb-2 block text-base text-muted-foreground',
								{ 'blog-card-date-transition': setTransitionClassname },
							)}
						>
							{format(new Date(data.postMeta?.date ?? ''), 'd MMMM yyyy')} ·{' '}
							{data.readingTime.text}
						</span>
						<h1
							className={cn('not-prose mb-6 text-4xl lg:text-5xl', {
								'blog-card-title-transition': setTransitionClassname,
							})}
						>
							{data.postMeta?.title}
						</h1>
						<Component
							components={{
								Callout,
							}}
						/>
					</div>
					<div className="mt-12 flex justify-between border-t border-muted-foreground py-6 text-lg">
						<ExternalLink
							href={`https://twitter.com/intent/tweet?${new URLSearchParams({
								url: `${windowRef.current?.location.origin}/blog/${params.slug}`,
								text: `I've just read "${data.postMeta?.title}" by @jogilvyt\n\n`,
							})}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Share on X
						</ExternalLink>
						<ExternalLink
							href={`https://github.com/jogilvyt/jacktaylor.co/blob/main/content/${params.slug}/index.mdx`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Edit this article
						</ExternalLink>
					</div>
				</article>
			</div>
			<ConverkitSignupForm
				title="Get helpful content like this straight to your inbox"
				type="card"
			/>
			<section className="mt-14 bg-muted py-14 md:mt-24 md:py-24">
				<div className="container">
					<h2 className="mb-8 text-4xl lg:text-5xl">
						If you liked this, you might also enjoy...
					</h2>
					<div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
						{data.relatedPosts.map((post, idx) => (
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
								className={clsx({
									'hidden lg:block': idx >= 2,
								})}
							/>
						))}
					</div>
				</div>
			</section>
		</>
	)
}

import { unstable_useViewTransitionState } from '@remix-run/react'
import clsx from 'clsx'
import { format } from 'date-fns'
import { cn } from '#app/utils/misc'
import { LazyImage } from './lazy-image'
import { Link } from './transition-links'

interface BlogCardProps {
	slug: string
	id: string
	date?: string
	title?: string
	description?: string
	image: {
		id?: string
		dataUri?: string | null
		alt?: string
	}
	className?: string
}

export function BlogCard({
	slug,
	id,
	title,
	description,
	date,
	image,
	className,
}: BlogCardProps) {
	const isTransitioning = unstable_useViewTransitionState(`/blog/${slug}`)

	return (
		<Link
			to={`/blog/${slug}`}
			aria-labelledby={`post-title-${id}`}
			className={clsx(
				'rounded-3xl bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				className,
			)}
			prefetch="intent"
		>
			<LazyImage
				width={432}
				height={288}
				imageUrl={`/resources/post-image/${image.id}`}
				dataUri={image.dataUri}
				alt={image.alt ?? ''}
				className={cn('mb-6 w-full rounded-3xl', {
					'blog-card-image-transition': isTransitioning,
				})}
			/>
			<div className="mb-8 px-6">
				<div
					className={cn('mb-2 text-sm text-muted-foreground', {
						'blog-card-date-transition': isTransitioning,
					})}
				>
					{format(new Date(date ?? ''), 'd MMMM yyyy')}
				</div>
				<h3
					className={cn('mb-2 text-3xl', {
						'blog-card-title-transition': isTransitioning,
					})}
					id={`post-title-${id}`}
				>
					{title}
				</h3>
				<p className="text-base">{description}</p>
			</div>
		</Link>
	)
}

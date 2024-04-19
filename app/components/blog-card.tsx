import { Link } from '@remix-run/react'
import clsx from 'clsx'
import { format } from 'date-fns'
import { LazyImage } from './lazy-image'

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
				className="mb-6 w-full rounded-3xl"
			/>
			<div className="mb-8 px-6">
				<div className="mb-2 text-sm text-muted-foreground">
					{format(new Date(date ?? ''), 'd MMMM yyyy')}
				</div>
				<h3 className="mb-2 text-3xl" id={`post-title-${id}`}>
					{title}
				</h3>
				<p className="text-base">{description}</p>
			</div>
		</Link>
	)
}

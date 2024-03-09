import clsx from 'clsx'
import * as React from 'react'
import { cn } from '#app/utils/misc'

interface LazyImageProps {
	dataUri?: string | null
	alt?: string
	imageUrl: string
	width?: number
	height?: number
	className?: string
	sizes?: string
}

export function LazyImage({
	dataUri,
	alt,
	imageUrl,
	width,
	height,
	className,
	sizes,
}: LazyImageProps) {
	const imgRef = React.useRef<HTMLImageElement>(null)
	const [isLoaded, setIsLoaded] = React.useState(false)

	let queryString = ''

	if (width && height) {
		queryString = `?w=${width}&h=${height}`
	}

	React.useEffect(() => {
		if (!imgRef.current) {
			return
		}
		if (imgRef.current.complete) {
			setIsLoaded(true)
			return
		}

		let isMounted = true
		imgRef.current?.addEventListener('load', () => {
			if (!imgRef.current || !isMounted) return
			setTimeout(() => {
				setIsLoaded(true)
			}, 0)
		})

		return () => {
			isMounted = false
		}
	}, [])

	if (!imageUrl) {
		return null
	}

	return (
		<div
			className={cn('relative max-w-full overflow-hidden', className)}
			style={{ width, height }}
		>
			{dataUri ? (
				<img
					src={dataUri}
					alt=""
					width={width}
					height={height}
					className="absolute bottom-0 left-0 right-0 top-0 h-full object-cover"
				/>
			) : null}
			<img
				ref={imgRef}
				src={`${imageUrl}${queryString}`}
				alt={alt ?? ''}
				width={width}
				height={height}
				className={clsx(
					`relative z-10 h-full w-full object-cover transition-opacity`,
					{
						'opacity-0': !isLoaded,
					},
				)}
				sizes={sizes}
			/>
		</div>
	)
}

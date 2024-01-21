import clsx from 'clsx'
import * as React from 'react'
import { cn } from '#app/utils/misc'

interface LazyImageProps {
	dataUri?: string | null
	alt?: string
	imageId: string
	width?: number
	height?: number
	className?: string
	sizes?: string
}

export function LazyImage({
	dataUri,
	alt,
	imageId,
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

	if (!imageId) {
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
					className="cover absolute bottom-0 left-0 right-0 top-0"
				/>
			) : null}
			<img
				ref={imgRef}
				src={`/resources/post-image/${imageId}${queryString}`}
				alt={alt ?? ''}
				width={width}
				height={height}
				className={clsx(`cover relative z-10 transition-opacity`, {
					'opacity-0': !isLoaded,
				})}
				sizes={sizes}
			/>
		</div>
	)
}

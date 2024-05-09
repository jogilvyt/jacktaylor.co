import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

interface GiftPlayerProps {
	src: string
	firstFrameSrc: string
	alt: string
}

export function GifPlayer({ src, firstFrameSrc, alt }: GiftPlayerProps) {
	const prefersReducedMotion = useReducedMotion()

	// play by default if the user doesn't have reduced motion enabled
	const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion)

	return (
		<div className="relative w-full">
			<picture>
				{!isPlaying && <source srcSet={firstFrameSrc} />}
				<img src={src} alt={alt} className="mx-auto w-full" />
			</picture>
			<div className="absolute bottom-0 right-0 rounded-tl-md bg-background/90 p-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsPlaying(!isPlaying)}
				>
					<Icon
						name={isPlaying ? 'pause' : 'play'}
						size="sm"
						className="mr-1"
					/>
					{isPlaying ? 'Pause GIF' : 'Play GIF'}
				</Button>
			</div>
		</div>
	)
}

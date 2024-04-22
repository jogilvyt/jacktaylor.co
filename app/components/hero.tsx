import clsx from 'clsx'
import * as React from 'react'

interface HeroProps {
	title: string
	secondaryTitle?: string
	image: React.ReactNode
	cta?: React.ReactNode
	condensed?: boolean
}

export function Hero({
	title,
	secondaryTitle,
	image,
	cta,
	condensed,
}: HeroProps) {
	return (
		<section
			className={clsx('container-narrow grid grid-cols-2 gap-x-20', {
				'py-24 md:py-44': !condensed,
				'py-16 md:py-24': condensed,
			})}
		>
			<div className="col-span-2 flex flex-col justify-center md:col-span-1 md:max-w-md">
				<h1 className="text-4xl lg:text-5xl">
					<span className="mb-4 block">{title}</span>
					{secondaryTitle ? (
						<span className="block text-muted-foreground">
							{secondaryTitle}
						</span>
					) : null}
				</h1>
				{cta ? <div className="mt-4">{cta}</div> : null}
			</div>
			<div className="relative hidden md:block">{image}</div>
		</section>
	)
}

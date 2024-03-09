import clsx from 'clsx'
import { type HTMLMotionProps, motion } from 'framer-motion'
import * as React from 'react'

interface HeroProps {
	title: string
	secondaryTitle: string
	images: [React.ReactNode, React.ReactNode]
	cta?: React.ReactNode
}

export function Hero({ title, secondaryTitle, images, cta }: HeroProps) {
	return (
		<section className="container-narrow grid grid-cols-2 gap-x-20 py-24 md:py-44">
			<div className="col-span-2 flex flex-col justify-center md:col-span-1 md:max-w-md">
				<h2 className="text-4xl lg:text-5xl">
					<AnimatedHeader className="mb-4 block" index={0}>
						{title}
					</AnimatedHeader>
					<AnimatedHeader className="block text-muted-foreground" index={1}>
						{secondaryTitle}
					</AnimatedHeader>
				</h2>
				{cta ? (
					<motion.div
						whileInView={{
							opacity: 1,
							y: 0,
							transition: {
								duration: 1,
								ease: 'easeOut',
								delay: 1,
							},
						}}
						initial={{
							opacity: 0,
							y: 10,
						}}
						viewport={{ once: true }}
						className="mt-8"
					>
						{cta}
					</motion.div>
				) : null}
			</div>
			<div className="relative hidden md:block">
				{images.map((image, index) => (
					<motion.div
						key={index}
						whileInView={{
							opacity: 1,
							y: 0,
							x: 0,
							transition: {
								duration: 1,
								ease: 'easeOut',
								delay: 0.8 + index * 0.2,
							},
						}}
						initial={{
							opacity: 0,
							y: index === 0 ? -5 : 5,
							x: index === 0 ? -5 : 5,
						}}
						viewport={{ once: true }}
						className={clsx('', {
							'absolute bottom-0 left-0 right-0 top-0': index > 0,
						})}
					>
						{image}
					</motion.div>
				))}
			</div>
		</section>
	)
}

interface AnimatedHeaderProps extends HTMLMotionProps<'span'> {
	index: number
}

function AnimatedHeader({ children, index, ...rest }: AnimatedHeaderProps) {
	return (
		<motion.span
			whileInView={{
				opacity: 1,
				y: 0,
				transition: {
					duration: 0.6,
					ease: 'easeOut',
					delay: index * 0.5,
				},
			}}
			initial={{
				opacity: 0,
				y: 10,
			}}
			viewport={{ once: true }}
			{...rest}
		>
			{children}
		</motion.span>
	)
}

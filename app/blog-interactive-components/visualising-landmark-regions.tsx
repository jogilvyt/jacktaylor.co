import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { Label } from '#app/components/ui/label'
import { Switch } from '#app/components/ui/switch'
import { cn } from '#app/utils/misc'

type Landmark =
	| 'banner'
	| 'navigation'
	| 'main'
	| 'complementary'
	| 'contentinfo'

export function VisualisingLandmarkRegions() {
	const [isBannerChecked, setIsBannerChecked] = React.useState(false)
	const [isNavigationChecked, setIsNavigationChecked] = React.useState(false)
	const [isMainChecked, setIsMainChecked] = React.useState(false)
	const [isComplementaryChecked, setIsComplementaryChecked] =
		React.useState(false)
	const [isContentinfoChecked, setIsContentinfoChecked] = React.useState(false)

	const [hoveredLandmark, setHoveredLandmark] = React.useState<Landmark | null>(
		null,
	)

	const getHoverProps = (landmark: Landmark) => {
		return {
			onMouseOver: () => setHoveredLandmark(landmark),
			onMouseOut: () => setHoveredLandmark(null),
		}
	}

	const sharedLandmarkClassNames =
		'rounded-md border border-transparent p-4 transition-colors'

	const getHoveredLandmarkClassNames = (landmark: Landmark) => {
		return {
			'border-secondary-foreground bg-secondary-foreground/20':
				hoveredLandmark === landmark,
		}
	}

	return (
		<>
			<p className="sr-only">
				Toggling these controls on and off changes how an example page layout is
				rendered, to demonstrate how a page with no landmark regions might look
				to a sighted user, and how it is improved by adding them.
			</p>
			<div className="not-prose mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
				<LandmarkSwitch {...getHoverProps('banner')}>
					<Switch
						id="banner"
						checked={isBannerChecked}
						onCheckedChange={setIsBannerChecked}
						aria-describedby="banner-description"
					/>
					<div className="flex flex-col gap-y-1 text-base">
						<Label htmlFor="banner">Banner</Label>
						<p
							className="text-sm text-muted-foreground"
							id="banner-description"
						>
							Exposed by the <code>header</code> HTML element.
						</p>
					</div>
				</LandmarkSwitch>
				<LandmarkSwitch {...getHoverProps('navigation')}>
					<Switch
						id="navigation"
						checked={isNavigationChecked}
						onCheckedChange={setIsNavigationChecked}
						aria-describedby="navigation-description"
					/>
					<div className="flex flex-col gap-y-1 text-base">
						<Label htmlFor="navigation">Navigation</Label>
						<p
							className="text-sm text-muted-foreground"
							id="navigation-description"
						>
							Exposed by the <code>nav</code> HTML element
						</p>
					</div>
				</LandmarkSwitch>
				<LandmarkSwitch {...getHoverProps('main')}>
					<Switch
						id="main"
						checked={isMainChecked}
						onCheckedChange={setIsMainChecked}
						aria-describedby="main-description"
					/>
					<div className="flex flex-col gap-y-1 text-base">
						<Label htmlFor="main">Main</Label>
						<p className="text-sm text-muted-foreground" id="main-description">
							Exposed by the <code>main</code> HTML element
						</p>
					</div>
				</LandmarkSwitch>
				<LandmarkSwitch {...getHoverProps('complementary')}>
					<Switch
						id="complementary"
						checked={isComplementaryChecked}
						onCheckedChange={setIsComplementaryChecked}
						aria-describedby="complementary-description"
					/>
					<div className="flex flex-col gap-y-1 text-base">
						<Label htmlFor="complementary">Complementary</Label>
						<p
							className="text-sm text-muted-foreground"
							id="complementary-description"
						>
							Exposed by the <code>aside</code> HTML element
						</p>
					</div>
				</LandmarkSwitch>
				<LandmarkSwitch {...getHoverProps('contentinfo')}>
					<Switch
						id="contentinfo"
						checked={isContentinfoChecked}
						onCheckedChange={setIsContentinfoChecked}
						aria-describedby="contentinfo-description"
					/>
					<div className="flex flex-col gap-y-1 text-base">
						<Label htmlFor="contentinfo">Contentinfo</Label>
						<p
							className="text-sm text-muted-foreground"
							id="contentinfo-description"
						>
							Exposed by the <code>footer</code> HTML element
						</p>
					</div>
				</LandmarkSwitch>
			</div>
			<AnimatePresence>
				<motion.div animate={{ height: 'auto' }}>
					<motion.div
						className="mb-6 flex flex-col gap-y-3 overflow-hidden rounded-md border border-foreground bg-foreground/20 p-4"
						layout="preserve-aspect"
						aria-hidden="true"
					>
						{/* Banner */}
						<motion.div
							key="banner"
							layout
							className={cn(
								'flex items-center justify-between',
								sharedLandmarkClassNames,
								{
									'border-muted-foreground bg-muted-foreground/20':
										isBannerChecked,
								},
								getHoveredLandmarkClassNames('banner'),
							)}
							style={{ order: isBannerChecked ? 0 : 3 }}
						>
							<Placeholder width={80} height={80} />
							<Placeholder width={35} height={35} />
						</motion.div>
						{/* Navigation */}
						<motion.div
							key="navigation"
							className={cn(
								sharedLandmarkClassNames,
								{
									'border-muted-foreground bg-muted-foreground/20':
										isNavigationChecked,
								},
								getHoveredLandmarkClassNames('navigation'),
							)}
							style={{ order: isNavigationChecked ? 0 : 4 }}
							layout
						>
							<div className="flex justify-center gap-x-8">
								<Placeholder width={75} height={15} />
								<Placeholder width={55} height={15} />
								<Placeholder width={115} height={15} />
								<Placeholder width={80} height={15} />
							</div>
						</motion.div>
						{/* Main */}
						<motion.div
							layout
							className={cn(
								'flex w-full gap-x-4',
								sharedLandmarkClassNames,
								'p-0',
								{
									'border-muted-foreground bg-muted-foreground/20':
										isMainChecked,
								},
								getHoveredLandmarkClassNames('main'),
							)}
							style={{
								flexDirection: isComplementaryChecked ? 'row' : 'column',
								order: isMainChecked ? 0 : 2,
							}}
						>
							<motion.div
								key="main"
								className="flex w-full flex-col gap-y-4 p-4"
								layout
							>
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder height={15} />
								<Placeholder width="60%" height={15} />
							</motion.div>
							{/* Complementary */}
							<motion.div
								key="complementary"
								className={cn(
									'flex min-w-[30%] flex-col gap-y-4',
									sharedLandmarkClassNames,
									{
										'border-muted-foreground bg-muted-foreground/20':
											isComplementaryChecked,
									},
									getHoveredLandmarkClassNames('complementary'),
								)}
								layout
							>
								<Placeholder height={15} width={85} />
								<div className="flex items-center gap-x-2">
									<Placeholder height={12} width={12} />
									<Placeholder height={15} width="45%" />
								</div>
								<div className="flex items-center gap-x-2">
									<Placeholder height={12} width={12} />
									<Placeholder height={15} width="65%" />
								</div>
								<div className="flex items-center gap-x-2">
									<Placeholder height={12} width={12} />
									<Placeholder height={15} width="25%" />
								</div>
								<div className="flex items-center gap-x-2">
									<Placeholder height={12} width={12} />
									<Placeholder height={15} width="37%" />
								</div>
							</motion.div>
						</motion.div>
						{/* Contentinfo */}
						<motion.div
							key="contentinfo"
							className={cn(
								'py-12',
								sharedLandmarkClassNames,
								{
									'border-muted-foreground bg-muted-foreground/20':
										isContentinfoChecked,
								},
								getHoveredLandmarkClassNames('contentinfo'),
							)}
							style={{ order: isContentinfoChecked ? 5 : 1 }}
							layout
						>
							<div className="flex flex-col items-center justify-between gap-y-4 md:flex-row">
								<div className="flex gap-x-6">
									<Placeholder width={65} height={15} />
									<Placeholder width={90} height={15} />
									<Placeholder width={45} height={15} />
								</div>
								<div className="flex gap-x-6">
									<Placeholder width={50} height={50} />
									<Placeholder width={50} height={50} />
									<Placeholder width={50} height={50} />
								</div>
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			</AnimatePresence>
		</>
	)
}

interface PlaceholderProps {
	width?: number | string
	height?: number | string
}

function Placeholder({ width = '100%', height = '100%' }: PlaceholderProps) {
	return (
		<motion.div
			style={{ width, height }}
			className="max-w-full rounded-md bg-muted-foreground"
			layout
		></motion.div>
	)
}

interface LandmarkSwitchProps extends React.HTMLAttributes<HTMLDivElement> {}

function LandmarkSwitch({ children, ...props }: LandmarkSwitchProps) {
	return (
		<div
			className="flex items-start gap-x-4 rounded-md border border-muted-foreground bg-muted-foreground/20 p-4 transition-colors hover:border-secondary-foreground hover:bg-secondary-foreground/20"
			{...props}
		>
			{children}
		</div>
	)
}

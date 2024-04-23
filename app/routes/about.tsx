import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { type MetaFunction } from '@remix-run/react'
import { Hero } from '#app/components/hero'
import { BringJoyIllustration } from '#app/components/illustrations/bring-joy'
import { DetailIllustration } from '#app/components/illustrations/detail'
import { PeopleFirstIllustration } from '#app/components/illustrations/people-first'
import { LazyImage } from '#app/components/lazy-image'
import { SayHiBlock } from '#app/components/say-hi-block'
import { generateSEOMetaTags } from '#app/utils/seo'

export const loader = ({ request }: LoaderFunctionArgs) => {
	return json({ ogUrl: request.url })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return generateSEOMetaTags({
		title: 'About me',
		description: `I'm a software engineer, music nerd and dog lover from the UK. Find out more about me.`,
		url: data?.ogUrl ?? '',
	})
}

export default function AboutRoute() {
	return (
		<>
			<Hero
				title="Hello 👋 I'm Jack."
				secondaryTitle="I'm a software engineer, music nerd and dog lover from the UK."
				image={
					<LazyImage
						width={400}
						height={400}
						imageUrl={`/images/headshot.jpg`}
						dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAApqm4maGyd4ykWniXXnCRa3COZm2FSmR3uLe1qamqgYOLVldrUkxfZV9mZ2pnVGZexsS5tLGrg36DSDRSQSg9YVtPanBaWm5VzM3EuLq4g4eYQkl3RElranBycYF0XXxr0NTQvsTHj5yzYneganqZg4+YgpaRZYyD2dvWy8/PqrO/kp2yl56toaepl6addpmL4+HW2djPxMS/trSxuLKsubWpqLCbhqKG6OPV4NvOz8q8xLytxLmpwrqlr7OYjKWC"
						alt=""
						className="rounded-3xl"
					/>
				}
				condensed
			/>
			<section className="bg-muted py-14 md:py-28">
				<div className="container">
					<div className="prose mx-auto max-w-[555px] dark:prose-invert lg:prose-xl prose-headings:font-medium">
						<h2>The story so far</h2>
						<h3>The beginning</h3>
						<p>
							I started my tech career after leaving school, working in QA at a
							local company. They were super supportive and gave me the time and
							space to play with code, which meant I was eventually able to
							start working as a developer on some of their products.
						</p>
						<p>
							From there, I freelanced in London for a few years, working on
							some really varied projects - from local authorities, to wealth
							management, to radio streaming. I learnt so much during this time,
							about how to build good software but also about how to work
							effectively in a team.
						</p>
						<p>
							Freelancing often means being thrown in at the deep end - joining
							a new team and delivering work on a short timescale. It was pretty
							intense at times, but it was an invaluable experience.
						</p>
						<h3>The middle bit</h3>
						<p>
							I took a permanent role as Lead UI Engineer at a PropTech company
							called Coyote Software. There, I led the front end development of
							the product, and managed a team of three other engineers. It was a
							steep learning curve, but I absolutely loved it and learnt a lot
							about working with and managing a team.
						</p>
						<LazyImage
							width={555}
							height={600}
							imageUrl={`/images/boating.png`}
							alt="Me steering a boat during a work trip to Copenhagen"
							className="not-prose rounded-3xl"
						/>
						<h3>Today</h3>
						<p>
							I'm currently a Software Engineer and Tech Lead at Pleo, in the
							Core Experience team. We work with all the feature teams to ensure
							we build a consistently great user experience across the product,
							focusing on getting the details right. Pleo is a great place to
							work, and it's beena a great experience callaborating across a big
							engineering department, driving complex multi-dependency projects
							forward.
						</p>
					</div>
				</div>
			</section>
			<section className="py-14 md:py-32">
				<div className="container">
					<h2 className="mb-20 text-4xl lg:text-5xl">
						These are my guiding principles
					</h2>
					<div className="flex flex-col gap-24 lg:flex-row">
						<div className="mx-auto max-w-[400px]">
							<div className="mb-8 flex items-center md:mb-16">
								<PeopleFirstIllustration className="mx-auto w-full max-w-[400px]" />
							</div>
							<h3 className="mb-6 text-xl md:text-4xl">People first</h3>
							<p className="text-base font-light md:text-lg">
								I put people at the centre of everything I do, whether it's the
								team I'm working with, the code I write that someone else needs
								to be able to understand, or the users I'm building for.
							</p>
						</div>
						<div className="mx-auto max-w-[400px]">
							<div className="mb-8 flex items-center md:mb-16">
								<DetailIllustration className="mx-auto w-full max-w-[400px]" />
							</div>
							<h3 className="mb-6 text-xl md:text-4xl">Focus on the detail</h3>
							<p className="text-base font-light md:text-lg">
								I spend time focusing on getting details right, as I believe
								it's what elevates an average experience to an amazing one.
							</p>
						</div>
						<div className="mx-auto max-w-[400px]">
							<div className="mb-8 flex items-center md:mb-16">
								<BringJoyIllustration className="mx-auto w-full max-w-[400px]" />
							</div>
							<h3 className="mb-6 text-xl md:text-4xl">Bring joy</h3>
							<p className="text-base font-light md:text-lg">
								I want to enjoy the work I do, and I want people to enjoy using
								the things I build. Spending a little bit of time adding some
								extra joy to things I'm involved in makes the experience better
								for everyone.
							</p>
						</div>
					</div>
				</div>
			</section>
			<SayHiBlock bgColour="bg-muted" />
		</>
	)
}

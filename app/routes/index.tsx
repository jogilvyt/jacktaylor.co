import { json } from '@remix-run/node'
import { Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import clsx from 'clsx'
import { BlogCard } from '#app/components/blog-card'
import { Hero } from '#app/components/hero'
import { HeroPeople, HeroScene } from '#app/components/illustrations/hero'
import { LazyImage } from '#app/components/lazy-image'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { prisma } from '#app/utils/db.server'
import { ConverkitSignupForm } from './_converkit+/signup-form'

export const meta: MetaFunction = () => [
	{
		title: 'Jack Taylor',
	},
	{ name: 'description', content: 'Helpful content for software engineers.' },
]

export async function loader() {
	const latestPosts = await prisma.post.findMany({
		orderBy: {
			postMeta: {
				date: 'desc',
			},
		},
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
		take: 3,
	})

	return json({ latestPosts })
}

export default function Index() {
	const { latestPosts } = useLoaderData<typeof loader>()

	return (
		<>
			<Hero
				title="Helpful content for software engineers."
				secondaryTitle="Better experiences for your users."
				images={[
					<HeroScene key="scene" className="w-full" />,
					<HeroPeople key="people" className="w-full" />,
				]}
				cta={
					<Button asChild variant="link" size="lg">
						<Link to="/blog">Read the blog</Link>
					</Button>
				}
			/>
			<section className="bg-muted py-14 md:pb-32 md:pt-44">
				<div className="container-narrow grid grid-cols-1 gap-x-28 md:grid-cols-2">
					<div>
						<div className="mx-auto mb-8 w-full max-w-[440px] rounded-3xl bg-secondary-foreground/20 md:mb-0">
							<LazyImage
								width={440}
								height={550}
								imageUrl={`/images/headshot.jpg`}
								dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAApqm4maGyd4ykWniXXnCRa3COZm2FSmR3uLe1qamqgYOLVldrUkxfZV9mZ2pnVGZexsS5tLGrg36DSDRSQSg9YVtPanBaWm5VzM3EuLq4g4eYQkl3RElranBycYF0XXxr0NTQvsTHj5yzYneganqZg4+YgpaRZYyD2dvWy8/PqrO/kp2yl56toaepl6addpmL4+HW2djPxMS/trSxuLKsubWpqLCbhqKG6OPV4NvOz8q8xLytxLmpwrqlr7OYjKWC"
								alt=""
								className="rounded-3xl md:-translate-y-12 md:translate-x-12"
							/>
						</div>
					</div>
					<div className="flex flex-col justify-center">
						<h2 className="mb-4 text-2xl md:mb-7 md:text-3xl">Hello! 👋</h2>
						<div className="mb-5 flex flex-col gap-y-2 text-lg font-light md:mb-9 md:gap-y-4 md:text-xl">
							<p>
								I'm Jack Taylor, and I write content to help software engineers
								create better experiences for their users.
							</p>
							<p>
								When I'm not at my desk, you'll find me listening to or playing
								music, sailing, or in the pub. I also love dogs, and I live with
								one on the South coast of the UK.
							</p>
						</div>
						<div className="mb-3 flex gap-x-4 md:mb-6">
							<Button asChild variant="outline" size="icon">
								<a
									href="https://twitter.com/jogilvyt"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Twitter"
								>
									<Icon name="twitter" size="lg" />
								</a>
							</Button>
							<Button asChild variant="outline" size="icon">
								<a
									href="https://www.linkedin.com/in/jack-taylor-b470a7130/"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn"
								>
									<Icon name="linkedin" size="lg" />
								</a>
							</Button>
							<Button asChild variant="outline" size="icon">
								<a
									href="https://github.com/jogilvyt"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="GitHub"
								>
									<Icon name="github" size="lg" />
								</a>
							</Button>
						</div>
						<div>
							<Button asChild variant="link" size="lg">
								<Link to="/about">Read more about me</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
			<section className="py-14 md:py-40">
				<div className="container">
					<div className="mb-10 grid grid-cols-1 md:mb-20 md:grid-cols-2">
						<LazyImage
							width={670}
							height={435}
							imageUrl="/images/laptop.jpg"
							dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAAAAAXCAcSKCIRPDUlRj44RDxANCw4DgEhIRgkMSYgST0nW09BYlhZXFRiSkJVLiIzLSAoPi8mWUkza15TcWduaGJ3VE5nOSs8JhUjOyojWEc1al1Xbmd0ZGJ8T01pNSY5CgAYKRYZSDosWlBOXFpoUVZwPUBeJBAvAAAQCAAMMCQaPzs3QURONj9WIypIAwAiAAASAAAGEQgAIiMKIyslGSUwAQ0sAAAYAAAUAAAGAAAADxUAERwABhURAAAZAAAU"
							alt=""
							className="hidden w-full rounded-3xl md:block"
						/>
						<div className="flex flex-col justify-center md:pl-20">
							<h2 className="mb-8 text-4xl lg:text-5xl">
								Latest content to help you create better experiences for your
								users
							</h2>
							<div>
								<Button asChild variant="link" size="lg">
									<Link to="/blog">Read the blog</Link>
								</Button>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
						{latestPosts.map((post, idx) => (
							<BlogCard
								key={post.id}
								slug={post.slug}
								id={post.id}
								date={post.postMeta?.date}
								title={post.postMeta?.title}
								description={post.postMeta?.description}
								image={{
									id: post.image?.id,
									dataUri: post.image?.dataUri,
									alt: post.postMeta?.imageAlt,
								}}
								className={clsx({
									'hidden lg:block': idx >= 2,
								})}
							/>
						))}
					</div>
				</div>
			</section>
			<ConverkitSignupForm />
			<section className="py-20 md:pb-32 md:pt-44">
				<div className="container-narrow">
					<div className="grid grid-cols-5 rounded-3xl bg-accent-foreground/20 md:ml-14">
						<LazyImage
							width={555}
							height={408}
							imageUrl="/images/say-hi.png"
							dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAANTBYLjJSHjhIHD5NK0FfMj1qJTJnACJXKCw0HCcnAB4AABsCISE1Lx5LIwBNAABCQVMoPVIXOlMAQVgAT100VV1LTlFKPD05aoRYa4hTcJBNeZtYgaJsg6B1fJVscIVSi6yEjrGBlbx/nsmJpdGYpc+cnMKNkLBunsagocmdp9OasN+it+eutuWxq9WhnMCBptKup9SqrNqmtOSqu+u1uui3rdenmr+KqNayqNaurNuos+Oru+q1uue4rNWolruM"
							className="col-span-5 h-full w-full rounded-3xl object-cover md:col-span-3 md:-ml-14 md:-mt-14"
							alt=""
						/>
						<div className="col-span-5 flex h-full flex-col justify-center px-6 py-8 md:col-span-2 md:py-20 md:pl-4 md:pr-20 lg:py-24 lg:pl-6 lg:pr-24">
							<h2 className="mb-6 text-4xl lg:text-5xl">Say hi!</h2>
							<p className="mb-4 text-lg font-light lg:text-xl">
								Want to reach out to say hi, ask a question or talk to me about
								my work?
							</p>
							<div>
								<Button asChild variant="link" size="lg">
									<Link to="/contact">Get in touch</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

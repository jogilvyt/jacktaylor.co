import { cn } from '#app/utils/misc'
import { LazyImage } from './lazy-image'
import { Link } from './transition-links'
import { Button } from './ui/button'

interface SayHiBlockProps {
	bgColour?: 'bg-background' | 'bg-muted'
}

export function SayHiBlock({ bgColour = 'bg-background' }: SayHiBlockProps) {
	return (
		<section className={cn('py-20 md:pb-32 md:pt-44', bgColour)}>
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
							Want to reach out to say hi, ask a question or talk to me about my
							work?
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
	)
}

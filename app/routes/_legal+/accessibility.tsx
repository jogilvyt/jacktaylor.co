import { Link } from '#app/components/transition-links'
import { Icon } from '#app/components/ui/icon'

export default function Accessibility() {
	return (
		<div className="container-narrow py-12">
			<div className="flex flex-col gap-12">
				<Link
					to="/"
					className="inline-flex items-center rounded-md text-xl ring-offset-background transition-all hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<Icon name="arrow-left" size="lg" className="mr-2" /> Return home
				</Link>
				<div className="prose mx-auto w-full dark:prose-invert lg:prose-xl prose-headings:font-medium">
					<h1>Accessibility statement</h1>
					<p>
						I take accessibility incredibly seriously. I want everyone to be
						able to access the content on this site.
					</p>
					<p>
						I've done my best to make this site accessible, and I've endeavoured
						to adhere to the Web Content Accessibility Guidelines (WCAG) version
						2.1 AA standard. However, I would love to hear any feedback you
						might have on issues you've found, or if there are any improvements
						I can make.
					</p>
					<p>
						If you do have any questions or feedback, please don't hesitate to{' '}
						<a
							// eslint-disable-next-line remix-react-routes/use-link-for-routes
							href="mailto:hello@jacktaylor.co"
							target="_blank"
							rel="noreferrer"
						>
							send me an email
						</a>
						. It will be hugely appreciated, and I'll make sure to get back to
						you as soon as I can.
					</p>
					<p>Thanks!</p>
				</div>
			</div>
		</div>
	)
}

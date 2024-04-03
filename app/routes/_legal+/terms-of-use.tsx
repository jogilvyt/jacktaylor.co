import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon'

export const meta: MetaFunction = () => [
	{
		title: 'Terms of use | Jack Taylor',
	},
]

export default function TermsOfUse() {
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
					<h1>Terms of use</h1>
					<p>
						Everything on this website is provided free of charge, and I will
						endeavour to keep it that way.
					</p>
					<p>
						If you're interested, have a look at the{' '}
						<Link to="/privacy-policy">Privacy Policy</Link>. This website is
						also{' '}
						<a
							href="https://github.com/jogilvyt/jacktaylor.co"
							target="_blank"
							rel="noreferrer"
						>
							open source
						</a>
						, so you can have a poke around the code if you're interested.
					</p>
					<p>
						If you have any questions or concerns, please{' '}
						<a
							// eslint-disable-next-line remix-react-routes/use-link-for-routes
							href="mailto:hello@jacktaylor.co"
							target="_blank"
							rel="noreferrer"
						>
							send me an email
						</a>
						.
					</p>
					<p>Thanks!</p>
				</div>
			</div>
		</div>
	)
}

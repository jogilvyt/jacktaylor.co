import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon'

export const meta: MetaFunction = () => [
	{
		title: 'Privacy policy | Jack Taylor',
	},
]

export default function PrivacyPolicy() {
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
					<h1>Privacy policy</h1>
					<p>
						I collect names and email addresses which I store in{' '}
						<a href="https://convertkit.com/" target="_blank" rel="noreferrer">
							Convertkit
						</a>
						. I use these to send out newsletters and updates about my blog. I
						will never share your information with anyone else.
					</p>
					<p>
						I also use{' '}
						<a href="https://usefathom.com/" target="_blank" rel="noreferrer">
							fathom analytics
						</a>{' '}
						to track page views and user interactions on my site. This helps me
						to understand what content is popular and how I can improve the what
						I write.
					</p>
					<p>
						If you have any questions about how I use your data, please{' '}
						<a
							// eslint-disable-next-line remix-react-routes/use-link-for-routes
							href="mailto:hello@jacktaylor.co"
							target="_blank"
							rel="noreferrer"
						>
							send me an email.
						</a>
					</p>
					<p>
						Finally, this whole website is{' '}
						<a
							href="https://github.com/jogilvyt/jacktaylor.co"
							target="_blank"
							rel="noreferrer"
						>
							open source
						</a>
						. Feel free to have a look at how I use any data I collect, and open
						a PR or raise an issue if you have any concerns.
					</p>
					<p>Thanks!</p>
				</div>
			</div>
		</div>
	)
}

// This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the Remix and/or browser default.

import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { useLocation } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { LazyImage } from '#app/components/lazy-image'
import { Link } from '#app/components/transition-links'
import { Icon } from '#app/components/ui/icon.tsx'

export async function loader() {
	throw new Response('Not found', { status: 404 })
}

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export default function NotFound() {
	// due to the loader, this component will never be rendered, but we'll return
	// the error boundary just in case.
	return <ErrorBoundary />
}

export function ErrorBoundary() {
	const location = useLocation()
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="container-narrow">
						<div className="flex flex-col gap-6">
							<Link
								to="/"
								className="inline-flex items-center rounded-md text-xl ring-offset-background transition-all hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<Icon name="arrow-left" size="lg" className="mr-2" /> Return
								home
							</Link>
							<LazyImage
								imageUrl="/images/dropped-icecream.jpg"
								alt=""
								width={982}
								height={400}
								className="max-h-[320px] rounded-3xl md:max-h-none"
							/>
							<div className="prose mx-auto dark:prose-invert lg:prose-xl prose-headings:font-medium">
								<h1>Oops! It looks like this page doesn't exist:</h1>
								<pre className="whitespace-pre-wrap break-all text-body-lg">
									{location.pathname}
								</pre>
							</div>
						</div>
					</div>
				),
			}}
		/>
	)
}

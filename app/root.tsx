import { useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { cssBundleHref } from '@remix-run/css-bundle'
import {
	json,
	type DataFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	unstable_useViewTransitionState,
	useFetcher,
	useFetchers,
	useLoaderData,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import * as React from 'react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { Fathom } from './components/fathom.tsx'
import { Navigation } from './components/navigation.tsx'
import { useToast } from './components/toaster.tsx'
import { Link } from './components/transition-links.tsx'
import { Button } from './components/ui/button.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './components/ui/tooltip.tsx'
import fontStyleSheetUrl from './styles/fonts.css'
import proseStyleSheetUrl from './styles/prose.css'
import tailwindStyleSheetUrl from './styles/tailwind.css'
import viewTransitionsStyleSheetUrl from './styles/view-transitions.css'
import { ClientHintCheck, getHints, useHints } from './utils/client-hints.tsx'
import { csrf } from './utils/csrf.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { useRequestInfo } from './utils/request-info.ts'
import { getTheme, setTheme, type Theme } from './utils/theme.server.ts'
import { getToast } from './utils/toast.server.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'preload', href: tailwindStyleSheetUrl, as: 'style' },
		cssBundleHref ? { rel: 'preload', href: cssBundleHref, as: 'style' } : null,
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		// These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'icon', type: 'image/x-icon', href: '/favicons/favicon.ico' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
		{ rel: 'stylesheet', href: proseStyleSheetUrl },
		{ rel: 'stylesheet', href: viewTransitionsStyleSheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
		{ rel: 'preload', href: fontStyleSheetUrl, as: 'style' },
		{ rel: 'stylesheet', href: fontStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? 'Jack Taylor' : 'Error | Jack Taylor' },
		{ name: 'description', content: 'Helpful content for software engineers.' },
	]
}

export async function loader({ request }: DataFunctionArgs) {
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()
	const [csrfToken, csrfCookieHeader] = await csrf.commitToken()

	return json(
		{
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
			csrfToken,
		},
		{
			headers: combineHeaders(
				toastHeaders,
				csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : null,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: ThemeFormSchema,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}
	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	return json({ success: true, submission }, responseInit)
}

function Document({
	children,
	nonce,
	theme = 'light',
	env = {},
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
}) {
	return (
		<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body className="bg-background text-foreground">
				<Fathom />
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<LiveReload nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const theme = useTheme()
	useToast(data.toast)
	const isTransitioning = unstable_useViewTransitionState('*')

	React.useEffect(() => {
		if (isTransitioning && window.scrollY > 64) {
			document.documentElement.classList.add('should-transition-navigation')
		} else {
			document.documentElement.classList.remove('should-transition-navigation')
		}
	}, [isTransitioning])

	return (
		<Document nonce={nonce} theme={theme} env={data.ENV}>
			<div className="flex h-screen flex-col justify-between">
				<header className="navigation-view-transition container mt-8 lg:mt-16">
					<nav>
						<div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
							<Navigation />
							<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
						</div>
					</nav>
				</header>

				<main className="flex-1" id="main-content">
					<Outlet />
				</main>

				<footer className="footer-view-transition bg-card pb-6 pt-6 md:pt-16">
					<div className="container">
						<div className="mb-4 flex flex-col items-center justify-between gap-4 md:mb-0 md:flex-row md:items-start md:gap-0">
							<Link
								to="/"
								className="relative block rounded-md text-xl font-semibold ring-offset-background transition-all before:absolute before:-bottom-0 before:h-1 before:w-full before:origin-left before:scale-x-0 before:bg-accent-foreground before:transition-transform before:content-[''] hover:before:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:before:transition-opacity motion-reduce:hover:before:opacity-100 md:mb-24 md:text-3xl"
							>
								Jack Taylor
							</Link>
							<div className="flex gap-x-4">
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
						</div>
						<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
							<ul className="flex gap-x-6 text-xs">
								<li>
									<Link
										to="/accessibility"
										className="relative rounded-md ring-offset-background transition-all before:absolute before:-bottom-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-accent-foreground before:transition-transform before:content-[''] hover:before:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:before:transition-opacity motion-reduce:hover:before:opacity-100"
									>
										Accessibilty
									</Link>
								</li>
								<li>
									<Link
										to="/privacy-policy"
										className="relative rounded-md ring-offset-background transition-all before:absolute before:-bottom-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-accent-foreground before:transition-transform before:content-[''] hover:before:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:before:transition-opacity motion-reduce:hover:before:opacity-100"
									>
										Privacy policy
									</Link>
								</li>
								<li>
									<Link
										to="/terms-of-use"
										className="relative rounded-md ring-offset-background transition-all before:absolute before:-bottom-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-accent-foreground before:transition-transform before:content-[''] hover:before:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:before:transition-opacity motion-reduce:hover:before:opacity-100"
									>
										Terms of use
									</Link>
								</li>
							</ul>
							<div className="text-center text-xs md:text-right">
								&copy; Jack Taylor {new Date().getFullYear()}
							</div>
						</div>
					</div>
				</footer>
			</div>
			<Toaster closeButton position="top-center" theme={theme} />
		</Document>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<AuthenticityTokenProvider token={data.csrfToken}>
			<HoneypotProvider {...data.honeyProps}>
				<MotionConfig reducedMotion="user">
					<TooltipProvider>
						<App />
					</TooltipProvider>
				</MotionConfig>
			</HoneypotProvider>
		</AuthenticityTokenProvider>
	)
}

export default withSentry(AppWithProviders)

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo.userPrefs.theme ?? hints.theme
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(f => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parse(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})
		return submission.value?.theme
	}
}

function ThemeSwitch({ userPreference }: { userPreference?: Theme | null }) {
	const fetcher = useFetcher<typeof action>()

	const [form] = useForm({
		id: 'theme-switch',
		lastSubmission: fetcher.data?.submission,
	})

	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? userPreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'

	const iconClassNames =
		'transition-transform duration-300 group-hover:scale-[1.15] motion-reduce:group-hover:scale-100'

	const modeLabel = {
		light: (
			<motion.span
				key="light"
				className="group h-[28px] leading-none"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0 }}
			>
				<Icon name="sun" size="xl" className={iconClassNames}>
					<span className="sr-only">Light theme</span>
				</Icon>
			</motion.span>
		),
		dark: (
			<motion.span
				key="dark"
				className="group h-[28px] leading-none"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0 }}
			>
				<Icon name="moon" size="xl" className={iconClassNames}>
					<span className="sr-only">Dark theme</span>
				</Icon>
			</motion.span>
		),
		system: (
			<motion.span
				key="system"
				className="group h-[28px] leading-none"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0 }}
			>
				<Icon name="laptop" size="xl" className={iconClassNames}>
					<span className="sr-only">System theme</span>
				</Icon>
			</motion.span>
		),
	}

	return (
		<fetcher.Form method="POST" {...form.props}>
			<input type="hidden" name="theme" value={nextMode} />
			<div className="flex gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="submit"
							className="group flex cursor-pointer items-center justify-center rounded-full border-2 border-foreground p-2 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-4"
						>
							<AnimatePresence initial={false} mode="wait">
								{modeLabel[mode]}
							</AnimatePresence>
						</button>
					</TooltipTrigger>
					<TooltipContent>
						<p className="flex items-center">
							<Icon
								name={
									nextMode === 'system'
										? 'laptop'
										: nextMode === 'light'
										  ? 'sun'
										  : 'moon'
								}
								size="sm"
								className="mr-2"
							/>
							Switch to {nextMode} theme
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</fetcher.Form>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}

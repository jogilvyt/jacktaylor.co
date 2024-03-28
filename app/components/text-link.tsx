import { Link, type LinkProps } from '@remix-run/react'
import { cn } from '#app/utils/misc'

const linkClassNames =
	'rounded-sm underline ring-offset-background transition-all hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export interface TextLinkProps extends LinkProps {}

export function TextLink({ children, className, ...props }: TextLinkProps) {
	return (
		<Link className={cn(linkClassNames, className)} {...props}>
			{children}
		</Link>
	)
}

export interface ExternalLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function ExternalLink({
	children,
	className,
	...props
}: ExternalLinkProps) {
	return (
		<a className={cn(linkClassNames, className)} {...props}>
			{children}
		</a>
	)
}

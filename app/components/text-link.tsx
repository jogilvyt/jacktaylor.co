import { Link, type LinkProps } from '@remix-run/react'
import { cn } from '#app/utils/misc'

export interface TextLinkProps extends LinkProps {}

export function TextLink({ children, className, ...props }: TextLinkProps) {
	return (
		<Link
			className={cn(
				'rounded-sm underline ring-offset-background transition-all hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	)
}

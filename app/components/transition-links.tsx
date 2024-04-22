import {
	type LinkProps,
	type NavLinkProps,
	Link as RemixLink,
	NavLink as RemixNavLink,
} from '@remix-run/react'

export function Link(props: LinkProps) {
	return <RemixLink {...props} unstable_viewTransition />
}

export function NavLink(props: NavLinkProps) {
	return <RemixNavLink {...props} unstable_viewTransition />
}

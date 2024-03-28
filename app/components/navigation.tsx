import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { NavLink } from '@remix-run/react'
import clsx from 'clsx'
import * as React from 'react'
import { Icon } from './ui/icon'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'

export function Navigation() {
	const [isOpen, setIsOpen] = React.useState(false)

	const navLinkClassNames = ({
		isActive,
		custom,
	}: {
		isActive: boolean
		custom?: string
	}) =>
		clsx(
			custom,
			`relative before:-z-10 before:absolute before:-bottom-0 before:h-1 before:w-full before:origin-left before:scale-x-0 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 before:bg-accent-foreground before:transition-transform motion-reduce:before:transition-opacity before:content-[''] hover:before:scale-x-100 motion-reduce:hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-all rounded-md`,
			isActive && 'before:scale-x-100 motion-reduce:before:opacity-100',
		)

	return (
		<>
			<NavLink
				to="/"
				className={({ isActive }) =>
					navLinkClassNames({
						isActive,
						custom: 'text-xl font-semibold md:text-3xl',
					})
				}
			>
				<div className="relative z-10">Jack Taylor</div>
			</NavLink>
			<ul className="hidden items-center gap-x-16 text-xl md:flex">
				<li>
					<NavLink
						to="/about"
						className={({ isActive }) =>
							navLinkClassNames({
								isActive,
								custom: 'text-2xl',
							})
						}
					>
						About
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/blog"
						className={({ isActive }) =>
							navLinkClassNames({
								isActive,
								custom: 'text-2xl',
							})
						}
					>
						Blog
					</NavLink>
				</li>
				<li>
					<NavLink
						to="/contact"
						className={({ isActive }) =>
							navLinkClassNames({
								isActive,
								custom: 'text-2xl',
							})
						}
					>
						Contact
					</NavLink>
				</li>
			</ul>

			<Sheet onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<button
						className="align-center ml-auto flex justify-between rounded border-2 border-foreground px-3 py-2 md:hidden"
						aria-label={isOpen ? 'Close menu' : 'Open menu'}
					>
						{isOpen ? (
							<Icon name="cross-1" className="mr-2" />
						) : (
							<Icon name="hamburger-menu" className="mr-2" />
						)}
						Menu
					</button>
				</SheetTrigger>
				<SheetContent>
					<VisuallyHidden.Root asChild>
						<SheetTitle>Menu</SheetTitle>
					</VisuallyHidden.Root>
					<nav>
						<ul className="flex flex-col gap-y-4">
							<li>
								<SheetClose asChild>
									<NavLink to="/" className="text-3xl">
										Home
									</NavLink>
								</SheetClose>
							</li>
							<li>
								<SheetClose asChild>
									<NavLink to="/about" className="text-3xl">
										About
									</NavLink>
								</SheetClose>
							</li>
							<li>
								<SheetClose asChild>
									<NavLink to="/blog" className="text-3xl">
										Blog
									</NavLink>
								</SheetClose>
							</li>
							<li>
								<SheetClose asChild>
									<NavLink to="/contact" className="text-3xl">
										Contact
									</NavLink>
								</SheetClose>
							</li>
						</ul>
					</nav>
				</SheetContent>
			</Sheet>
		</>
	)
}

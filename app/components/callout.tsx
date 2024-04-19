import { Icon } from './ui/icon'

interface CalloutProps {
	children: React.ReactNode
}

export function Callout({ children }: CalloutProps) {
	return (
		<div className="flex items-start gap-x-4 rounded-lg border-2 border-foreground bg-muted p-4">
			<div className="shrink-0 text-3xl">
				<Icon name="info-circled" size="font" className="text-foreground" />
			</div>
			<div className="[&>p]:m-0">{children}</div>
		</div>
	)
}

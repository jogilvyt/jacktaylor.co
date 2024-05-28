import * as InteractiveComponents from '#app/blog-interactive-components'

interface InteractiveComponentProps {
	component: keyof typeof InteractiveComponents
}

export function InteractiveComponent({ component }: InteractiveComponentProps) {
	const Component = InteractiveComponents[component]

	return <Component />
}

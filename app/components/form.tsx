import { cn } from '#app/utils/misc'

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormControl({ children, className, ...props }: FormControlProps) {
	return (
		<div
			className={cn('relative mb-2 flex flex-col gap-y-2 pb-6', className)}
			{...props}
		>
			{children}
		</div>
	)
}

function ValidationMessage({
	children,
	className,
	...props
}: FormControlProps) {
	return (
		<span
			className={cn(
				'danger absolute bottom-0 left-0 text-sm text-destructive-foreground',
				className,
			)}
			{...props}
		>
			{children}
		</span>
	)
}

FormControl.ValidationMessage = ValidationMessage

export { FormControl }

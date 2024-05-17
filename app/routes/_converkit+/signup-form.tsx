import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { trackEvent } from 'fathom-client'
import { useEffect } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { SpamError } from 'remix-utils/honeypot/server'
import { z } from 'zod'
import { FormControl } from '#app/components/form'
import { InboxIllustration } from '#app/components/illustrations/inbox'
import { TextLink } from '#app/components/text-link'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { honeypot } from '#app/utils/honeypot.server'

const EmailSignupFormSchema = z.object({
	email: z
		.string({ required_error: 'Please enter your email' })
		.min(1, 'Please enter your email')
		.email('Please enter a valid email'),
	firstName: z
		.string({ required_error: 'Please enter your first name' })
		.min(1, 'Please enter your first name'),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: () =>
			EmailSignupFormSchema.transform(async (data, ctx) => {
				try {
					honeypot.check(formData)
					await fetch(
						`https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
						{
							headers: {
								Accept: 'application/json',
								'Content-Type': 'application/json',
							},
							method: 'POST',
							body: JSON.stringify({
								api_key: process.env.CONVERTKIT_API_KEY,
								email: data.email,
								first_name: data.firstName,
							}),
						},
					)

					return data
				} catch (error) {
					console.error(error)
					if (error instanceof SpamError) {
						ctx.addIssue({
							code: 'custom',
							message: 'Form not submitted properly',
						})
						return z.NEVER
					}
					ctx.addIssue({
						code: 'custom',
						message: 'Oh man, something went wrong. Please try again.',
					})
					return z.NEVER
				}
			}),
		async: true,
	})

	if (!submission.value || submission.intent !== 'submit') {
		return json(submission, { status: 400 })
	}

	return json(submission)
}

interface ConvertkitSignupFormProps {
	title?: string
	type?: 'card' | 'section'
}

export function ConverkitSignupForm({
	title = 'Get helpful content straight to your inbox',
	type = 'section',
}: ConvertkitSignupFormProps) {
	const fetcher = useFetcher<typeof action>()
	// Last submission returned by the server
	const lastSubmission = fetcher.data

	const [form, fields] = useForm({
		id: 'email-signup-form',
		constraint: getFieldsetConstraint(EmailSignupFormSchema),
		lastSubmission,
		onValidate({ formData }) {
			return parse(formData, { schema: EmailSignupFormSchema })
		},
		shouldValidate: 'onBlur',
	})

	useEffect(() => {
		if (lastSubmission?.value) {
			trackEvent('Newsletter signup')
		}
	}, [lastSubmission])

	const content = (
		<div className="grid grid-cols-3 gap-x-12">
			<div className="col-span-3 md:col-span-2">
				<h2 className="mb-8 text-4xl lg:text-5xl">{title}</h2>
				<div className="mb-8 flex flex-col gap-y-4 text-lg font-light">
					<p>
						You'll be notified when I publish any new content, and you can reply
						to the emails with any questions or comments you might have.
					</p>
					<p>
						No spam, <span className="font-semibold italic">ever</span> - and
						you can unsubscribe at any time.
					</p>
				</div>
				{!lastSubmission ? (
					<fetcher.Form
						className="flex flex-wrap items-center gap-x-4"
						method="POST"
						action="/signup-form"
						{...form.props}
					>
						<HoneypotInputs />
						<FormControl className="w-full flex-grow md:w-auto">
							<Label htmlFor={fields.firstName.id}>First name</Label>
							<Input {...conform.input(fields.firstName, { type: 'text' })} />
							{fields.firstName.error ? (
								<FormControl.ValidationMessage>
									{fields.firstName.error}
								</FormControl.ValidationMessage>
							) : null}
						</FormControl>
						<FormControl className="flex-grow">
							<Label htmlFor={fields.email.id}>Email address</Label>
							<Input {...conform.input(fields.email, { type: 'email' })} />
							{fields.email.error ? (
								<FormControl.ValidationMessage>
									{fields.email.error}
								</FormControl.ValidationMessage>
							) : null}
						</FormControl>
						<Button
							type="submit"
							variant="outline"
							size="icon"
							aria-label="Submit"
							className="mb-2"
							disabled={fetcher.state !== 'idle'}
						>
							<Icon
								name={fetcher.state === 'idle' ? 'arrow-right' : 'update'}
								className={fetcher.state === 'idle' ? '' : 'animate-spin'}
								size="lg"
							/>
						</Button>
					</fetcher.Form>
				) : (
					<div className="mb-8 flex flex-col gap-y-2 rounded-md border-2 border-accent-foreground bg-accent-foreground/20 p-6 text-foreground">
						<p className="text-lg">You've signed up successfully. Thanks! 🎉</p>
						<p className="font-light">
							You'll receive an email in your inbox soon asking you to confirm
							your subscription.
						</p>
					</div>
				)}
				<p className="text-sm font-light">
					By signing up for email updates, you agree to the{' '}
					<TextLink to="/terms-of-use">Terms of Use</TextLink> and{' '}
					<TextLink to="/privacy-policy">Privacy Policy</TextLink>
				</p>
			</div>
			<div className="col-span-1 hidden items-center md:flex">
				<InboxIllustration className="mx-auto w-full max-w-[300px]" />
			</div>
		</div>
	)

	if (type === 'card') {
		return (
			<div className="container-narrow">
				<div className="flex flex-col gap-y-2 rounded-2xl border-2 border-secondary-foreground bg-secondary-foreground/20 p-10 text-foreground">
					{content}
				</div>
			</div>
		)
	}

	return (
		<section className="bg-muted py-16 md:py-44">
			<div className="container-narrow">{content}</div>
		</section>
	)
}

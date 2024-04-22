import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import * as E from '@react-email/components'
import {
	type DataFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useFetcher, type MetaFunction } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { SpamError } from 'remix-utils/honeypot/server'
import { z } from 'zod'
import { FormControl } from '#app/components/form'
import { Hero } from '#app/components/hero'
import { LazyImage } from '#app/components/lazy-image'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import { Textarea } from '#app/components/ui/textarea'
import { sendEmail } from '#app/utils/email.server'
import { honeypot } from '#app/utils/honeypot.server'
import { generateSEOMetaTags } from '#app/utils/seo.ts'

const ContactFormSchema = z.object({
	name: z
		.string({ required_error: 'Please enter your name' })
		.min(1, 'Please enter your name'),
	email: z
		.string({ required_error: 'Please enter your email address' })
		.min(1, 'Please enter your email address')
		.email('Please enter a valid email address'),
	message: z
		.string({ required_error: 'Please enter a message' })
		.min(1, 'Please enter a message'),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: () =>
			ContactFormSchema.transform(async (data, ctx) => {
				try {
					honeypot.check(formData)
					sendEmail({
						// TODO: change this to hello@jacktaylor.co once it's set up
						to: 'jack.s.o.taylor@googlemail.com',
						subject: 'New contact form submission on jacktaylor.co',
						react: (
							<NewSubmissionEmail
								name={data.name}
								email={data.email}
								message={data.message}
							/>
						),
					})
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

export const loader = ({ request }: LoaderFunctionArgs) => {
	return json({ ogUrl: request.url })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return generateSEOMetaTags({
		title: 'Contact me',
		description: 'Reach out, say hi, or ask a question.',
		url: data?.ogUrl ?? '',
	})
}

export default function ContactRoute() {
	const fetcher = useFetcher<typeof action>()
	// Last submission returned by the server
	const lastSubmission = fetcher.data

	const [form, fields] = useForm({
		id: 'email-signup-form',
		constraint: getFieldsetConstraint(ContactFormSchema),
		lastSubmission,
		onValidate({ formData }) {
			return parse(formData, { schema: ContactFormSchema })
		},
		shouldValidate: 'onBlur',
	})

	return (
		<>
			<Hero
				title="Reach out, say hi,"
				secondaryTitle="or ask a question."
				image={
					<LazyImage
						width={320}
						height={400}
						imageUrl={`/images/headshot.jpg`}
						dataUri="data:image/bmp;base64,Qk32BAAAAAAAADYAAAAoAAAACAAAAAgAAAABABgAAAAAAMAAAAATCwAAEwsAAAAAAAAAAAAApqm4maGyd4ykWniXXnCRa3COZm2FSmR3uLe1qamqgYOLVldrUkxfZV9mZ2pnVGZexsS5tLGrg36DSDRSQSg9YVtPanBaWm5VzM3EuLq4g4eYQkl3RElranBycYF0XXxr0NTQvsTHj5yzYneganqZg4+YgpaRZYyD2dvWy8/PqrO/kp2yl56toaepl6addpmL4+HW2djPxMS/trSxuLKsubWpqLCbhqKG6OPV4NvOz8q8xLytxLmpwrqlr7OYjKWC"
						alt=""
						className="rounded-3xl"
					/>
				}
				condensed
			/>
			<section className="bg-muted py-14 md:py-32">
				<div className="mx-auto max-w-[420px]">
					<p className="mb-6 text-center text-2xl">
						If you want to get in touch, fill out the form and I'll get back to
						you.
						<br />
						Or you can find me here...
					</p>
					<div className="mb-6 flex justify-center gap-x-4 md:mb-12">
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
						<Button asChild variant="outline" size="icon">
							<a
								// eslint-disable-next-line remix-react-routes/use-link-for-routes
								href="mailto:hello@jacktaylor.co"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Email"
							>
								<Icon name="envelope-closed" size="lg" />
							</a>
						</Button>
					</div>
					{!lastSubmission ? (
						<fetcher.Form
							className="flex flex-col"
							method="POST"
							{...form.props}
						>
							<HoneypotInputs />
							<FormControl className="w-full flex-grow md:w-auto">
								<Label htmlFor={fields.name.id}>Name</Label>
								<Input {...conform.input(fields.name, { type: 'text' })} />
								{fields.name.error ? (
									<FormControl.ValidationMessage>
										{fields.name.error}
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
							<FormControl className="flex-grow">
								<Label htmlFor={fields.message.id}>Message</Label>
								<Textarea {...conform.textarea(fields.message)} />
								{fields.message.error ? (
									<FormControl.ValidationMessage>
										{fields.message.error}
									</FormControl.ValidationMessage>
								) : null}
							</FormControl>
							<Button
								type="submit"
								variant="default"
								disabled={fetcher.state !== 'idle'}
							>
								Submit
							</Button>
						</fetcher.Form>
					) : (
						<div className="mb-8 flex flex-col gap-y-2 rounded-md border-2 border-accent-foreground bg-accent-foreground/20 p-6 text-center text-foreground">
							<p className="text-lg">Thanks for reaching out! 🎉</p>
							<p className="font-light">
								I'll be in touch soon with a response.
							</p>
						</div>
					)}
				</div>
			</section>
		</>
	)
}

interface NewSubmissionEmailProps {
	name: string
	email: string
	message: string
}

const NewSubmissionEmail = ({
	name,
	email,
	message,
}: NewSubmissionEmailProps) => {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>New contact form submission from {name}</E.Text>
				</h1>
				<p>
					<E.Text>
						<strong>Name:</strong> {name}
					</E.Text>
				</p>
				<p>
					<E.Text>
						<strong>Email:</strong> {email}
					</E.Text>
				</p>
				<p>
					<E.Text>
						<strong>Message:</strong> {message}
					</E.Text>
				</p>
			</E.Container>
		</E.Html>
	)
}

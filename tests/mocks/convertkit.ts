import { faker } from '@faker-js/faker'
import { type HttpHandler, HttpResponse, http } from 'msw'
import { writeSignup } from './utils'

const { json } = HttpResponse

export const handlers: Array<HttpHandler> = [
	http.post(
		`https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
		async ({ request }) => {
			const body = await request.json()
			console.info('🔶 mocked signup form fields:', body)

			await writeSignup(body)

			return json({
				subscription: {
					id: faker.number.int(),
					state: 'inactive',
					created_at: new Date().toISOString(),
					source: 'API::V3::SubscriptionsController (external)',
					referrer: null,
					subscribable_id: faker.number.int(),
					subscribable_type: 'form',
					subscriber: { id: faker.number.int() },
				},
			})
		},
	),
]

import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { hashElement } from 'folder-hash'
import { generateContentCache } from '#app/utils/content-cache.server'
import { prisma } from '#app/utils/db.server'

export async function action({ request }: DataFunctionArgs) {
	try {
		if (request.headers.get('auth') !== process.env.CACHE_CONTENT_SECRET) {
			// The token is invalid, so redirect to another site
			console.log('❌ Nope! Invalid token')
			return redirect('https:/www.google.com/')
		}

		const dbContentHash = await prisma.contentHash.findFirst({
			select: { hash: true },
		})

		if (!dbContentHash?.hash) {
			// if there is no hash in the database, we should generate the content cache
			console.log(
				'😶‍🌫️ No previously generated content cache found. Generating content cache...',
			)
			await generateContentCache()
			return new Response('Content cache generated', { status: 200 })
		}

		const currentContentHash = await hashElement(process.cwd() + '/content')
		if (dbContentHash.hash !== currentContentHash.hash) {
			// if the hash in the database is different from the current hash, we should generate the content cache
			console.log(
				'📝 Previously generated content cache is out of date. Generating content cache...',
			)
			await generateContentCache()
			console.log('✅ Updated content cache generated')
			return new Response('Content cache generated', { status: 200 })
		}

		console.log('✅ Content cache has not changed')
		return new Response('Content not changed', { status: 200 })
	} catch (err) {
		console.error(
			'😱 Whoops! Something went wrong generating the content cache...',
			err,
		)
		return new Response('Content cache generation failed', { status: 500 })
	}
}

export const loader = () => redirect('/', { status: 404 })

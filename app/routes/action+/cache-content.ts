import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { hashElement } from 'folder-hash'
import { generateContentCache } from '#app/utils/content-cache.server'
import { prisma } from '#app/utils/db.server'

export async function action({ request }: DataFunctionArgs) {
	try {
		if (request.headers.get('auth') !== process.env.CACHE_CONTENT_SECRET) {
			// The token is invalid, so we redirect to another site
			return redirect('https:/www.google.com/')
		}

		const dbContentHash = await prisma.contentHash.findFirst({
			select: { hash: true },
		})

		if (!dbContentHash?.hash) {
			// if there is no hash in the database, we should generate the content cache
			await generateContentCache()
			return new Response('Content cache generated', { status: 200 })
		}

		const currentContentHash = await hashElement(process.cwd() + '/content')
		if (dbContentHash.hash !== currentContentHash.hash) {
			// if the hash in the database is different from the current hash, we should generate the content cache
			await generateContentCache()
			return new Response('Content cache generated', { status: 200 })
		}

		return new Response('Content not changed', { status: 200 })
	} catch (err) {
		console.error('Whoops!', err)
		return new Response('Content cache generation failed', { status: 500 })
	}
}

export const loader = () => redirect('/', { status: 404 })

import { parse } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { type DataFunctionArgs } from '@remix-run/node'
import sharp from 'sharp'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.ts'

const imageSchema = z.object({
	w: z.number().optional(),
	h: z.number().optional(),
})

export async function loader({ params, request }: DataFunctionArgs) {
	invariantResponse(params.imageId, 'Image ID is required', { status: 400 })
	const image = await prisma.postImage.findUnique({
		where: { id: params.imageId },
		select: { contentType: true, blob: true },
	})

	invariantResponse(image, 'Not found', { status: 404 })

	const url = new URL(request.url)
	const imageSizeParams = parse(url.searchParams, { schema: imageSchema })

	if (imageSizeParams.value?.w && imageSizeParams.value?.h) {
		const resizedImage = await sharp(image.blob)
			.resize({
				width: imageSizeParams.value.w,
				height: imageSizeParams.value.h,
			})
			.toBuffer()
		return new Response(resizedImage, {
			headers: {
				'Content-Type': image.contentType,
				'Content-Length': Buffer.byteLength(resizedImage).toString(),
				'Content-Disposition': `inline; filename="${params.imageId}"`,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		})
	}

	return new Response(image.blob, {
		headers: {
			'Content-Type': image.contentType,
			'Content-Length': Buffer.byteLength(image.blob).toString(),
			'Content-Disposition': `inline; filename="${params.imageId}"`,
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}

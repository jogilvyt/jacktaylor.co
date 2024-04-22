import { readFileSync } from 'fs'
import path from 'path'
import { parse } from '@conform-to/zod'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { z } from 'zod'
import { getDomainUrl } from '#app/utils/misc'

declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> {
		tw?: string
	}
}

const getJsx = ({
	title,
	description,
	url,
}: {
	title: string
	description?: string
	url: string
}) => (
	<div tw="bg-[#020817] flex w-full h-full px-8 pb-8 font-sans">
		<div tw="flex flex-col w-full">
			<div tw="flex flex-col w-full">
				<h1 tw="text-[#f8fafc] text-4xl mb-0 leading-none">{title}</h1>
				{description && <p tw="text-[#94a3b8] text-2xl">{description}</p>}
			</div>
			<div tw="flex space-between mt-auto items-end">
				<span tw="text-sm text-[#94a3b8]">jacktaylor.co · @jogilvyt</span>
				<div tw="flex max-w-[120px] ml-auto mt-auto">
					<img
						src={`${url}/images/headshot.jpg`}
						alt=""
						tw="max-w-full object-cover rounded-3xl ml-auto"
					/>
				</div>
			</div>
		</div>
	</div>
)

const optionsSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const options = parse(url.searchParams, { schema: optionsSchema })

	if (!options.value?.title || !options.value?.description) {
		return new Response('Please provide a valid title and description', {
			status: 400,
		})
	}

	let truncatedTitle = options.value.title
	if (options.value.title.split(' ').length > 15) {
		truncatedTitle =
			options.value.title.split(' ').slice(0, 15).join(' ') + '...'
	}

	let truncatedDescription = options.value.description
	if (options.value.description.split(' ').length > 15) {
		truncatedDescription =
			options.value.description.split(' ').slice(0, 15).join(' ') + '...'
	}

	const svg = await satori(
		getJsx({
			title: truncatedTitle,
			description: truncatedDescription,
			url: getDomainUrl(request),
		}),
		{
			width: 600,
			height: 400,
			fonts: [
				{
					name: 'Helvetiva Neue',
					data: readFileSync(
						path.resolve(
							path.join(
								process.cwd(),
								'public',
								'fonts',
								'HelveticaNeue-Medium.woff',
							),
						),
					),
					weight: 400,
					style: 'normal',
				},
			],
		},
	)
	const resvg = new Resvg(svg)
	const pngData = resvg.render()
	const data = pngData.asPng()
	return new Response(data, {
		headers: {
			'Content-Type': 'image/png',
		},
	})
}

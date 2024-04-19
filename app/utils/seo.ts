export function generateSEOMetaTags({
	url,
	title = 'Jack Taylor',
	ogImageTitle,
	description = 'Helpful content for software engineers.',
	keywords = '',
}: {
	url: string
	title?: string
	ogImageTitle?: string
	description?: string
	keywords?: string
}) {
	const ogTitle = ogImageTitle ?? title
	const ogImageUrl = new URL('/resources/og-image', url ?? '')
	ogImageUrl.searchParams.set('title', ogTitle)
	ogImageUrl.searchParams.set('description', description)

	return [
		{ title: `${title} | Jack Taylor` },
		{ name: 'description', content: description },
		{ name: 'keywords', content: keywords },
		{ name: 'image', content: ogImageUrl },
		{ name: 'og:url', content: url },
		{ name: 'og:title', content: title },
		{ name: 'og:description', content: description },
		{ name: 'og:image', content: ogImageUrl },
		{
			name: 'twitter:card',
			content: 'summary_large_image',
		},
		{ name: 'twitter:creator', content: '@jogilvyt' },
		{ name: 'twitter:site', content: '@jogilvyt' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: ogImageUrl },
		{ name: 'twitter:image:alt', content: title },
	]
}

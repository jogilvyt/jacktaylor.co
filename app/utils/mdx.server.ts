import { bundleMDX } from 'mdx-bundler'
import getReadingTime from 'reading-time'
import rehypeHighlight from 'rehype-highlight'

export async function getMdxPage(mdx: string) {
	const { code } = await bundleMDX({
		source: mdx,
		cwd: process.cwd(),
		mdxOptions(options) {
			options.rehypePlugins = [
				...(options.rehypePlugins ?? []),
				rehypeHighlight,
			]
			return options
		},
	})

	return code
}

export function calculateReadingTime(mdx: string) {
	return getReadingTime(mdx)
}

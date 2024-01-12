import { bundleMDX } from 'mdx-bundler'

export async function getMdxPage(mdx: string) {
	const { code } = await bundleMDX({
		source: mdx,
		cwd: process.cwd(),
	})

	return code
}

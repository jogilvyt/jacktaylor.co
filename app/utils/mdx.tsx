import * as mdxBundler from 'mdx-bundler/client/index.js'
import * as React from 'react'

export function useMdxComponent({ content }: { content: string }) {
	const Component = React.useMemo(() => {
		return mdxBundler.getMDXComponent(content)
	}, [content])

	return Component
}

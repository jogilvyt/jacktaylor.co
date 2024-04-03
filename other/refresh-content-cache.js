async function refreshContentCache() {
	const hostname =
		process.env.GITHUB_REF_NAME === 'dev'
			? 'https://jacktaylor-co-ed11-staging.fly.dev'
			: process.env.GITHUB_REF_NAME === 'main'
			  ? 'https://jacktaylor.co'
			  : 'http://localhost:3000'
	const authToken = process.env.CACHE_CONTENT_SECRET

	try {
		console.log('🚀 Calling content cache endpoint...')
		const response = await fetch(`${hostname}/action/refresh-content-cache`, {
			method: 'POST',
			headers: {
				auth: authToken,
				'Content-Type': 'application/json',
			},
		})
		if (response.status === 500) {
			throw new Error('Error when calling content cache endpoint.')
		}
		console.log('🎉 Content cache refreshed!')
	} catch (e) {
		console.log('😱 Whoops! Unable to call content cache endpoint.')
		throw new Error(e)
	}
}

void refreshContentCache()

async function refreshContentCache() {
	// TODO: change this when running outside of local env
	const hostname = 'http://localhost:3000'
	const [authToken] = process.argv.slice(2)

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

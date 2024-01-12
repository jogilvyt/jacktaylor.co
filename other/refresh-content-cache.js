async function refreshContentCache() {
	// TODO: change this when running outside of local env
	const hostname = 'http://localhost:3000'
	const [authToken] = process.argv.slice(2)

	try {
		console.log('🚀 Calling content cache endpoint...')
		await fetch(`${hostname}/action/refresh-content-cache`, {
			method: 'POST',
			headers: {
				auth: authToken,
				'Content-Type': 'application/json',
			},
		})
		console.log('🎉 Content cache refreshed!')
	} catch (e) {
		console.log('😱 Whoops! Unable to call content cache endpoint.', e)
		throw new Error(e)
	}
}

void refreshContentCache()

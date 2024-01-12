async function refreshContentCache() {
	// TODO: change this when running outside of local env
	const hostname = 'http://localhost:3000'
	const [authToken] = process.argv.slice(2)

	try {
		await fetch(`${hostname}/action/cache-content`, {
			method: 'POST',
			headers: {
				auth: authToken,
				'Content-Type': 'application/json',
			},
		})
	} catch (e) {
		console.log('Something went wrong caching the content', e)
		throw new Error(e)
	}
}

void refreshContentCache()

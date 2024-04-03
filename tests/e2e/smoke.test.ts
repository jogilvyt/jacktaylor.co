import { expect, test } from '@playwright/test'

test('the page loads', async ({ page }) => {
	await page.goto('/')
	await expect(
		page.getByText('Helpful content for software engineers.'),
	).toBeVisible()
})

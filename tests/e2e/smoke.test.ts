import { expect, test } from '@playwright/test'

test('the page loads', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('Home page')).toBeVisible()
})

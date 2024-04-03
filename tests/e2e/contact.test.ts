import { expect, test } from '@playwright/test'

test('the contact form works', async ({ page }) => {
	await page.goto('/contact')

	// check the validation works
	await page.getByText('Submit').click()
	await expect(page.getByText('Please enter your name')).toBeVisible()
	await expect(page.getByText('Please enter your email address')).toBeVisible()
	await expect(page.getByText('Please enter a message')).toBeVisible()

	// fill out the form and submit
	await page.getByLabel('Name').fill('Jack')
	await page.getByLabel('Email address').fill('test@example.com')
	await page.getByLabel('Message').fill('Hello!')

	await page.getByText('Submit').click()

	// expect the form to be submitted
	await expect(page.getByText('Thanks for reaching out!')).toBeVisible()
})

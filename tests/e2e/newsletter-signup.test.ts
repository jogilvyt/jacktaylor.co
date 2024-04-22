import { expect, test } from '@playwright/test'

test('the newsletter signup works', async ({ page }) => {
	await page.goto('/')

	// check the validation works
	await page.getByRole('button', { name: 'Submit' }).click()
	await expect(page.getByText('Please enter your first name')).toBeVisible()
	await expect(page.getByText('Please enter your email')).toBeVisible()

	// fill out the form and submit
	await page.getByLabel('First name').fill('Jack')
	await page.getByLabel('Email address').fill('test@example.com')
	await page.getByRole('button', { name: 'Submit' }).click()

	await expect(
		page.getByText(`You've signed up successfully. Thanks!`),
	).toBeVisible()
})

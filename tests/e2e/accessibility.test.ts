import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

test('Home page: there are no common accessibility issues', async ({
	page,
}) => {
	await page.goto('/')
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})

test('About page: there are no common accessibility issues', async ({
	page,
}) => {
	await page.goto('/about')
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})

test('Contact page: there are no common accessibility issues', async ({
	page,
}) => {
	await page.goto('/contact')
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})

test('Blog listing page: there are no common accessibility issues', async ({
	page,
}) => {
	await page.goto('/blog')
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})

test('Blog post page: there are no common accessibility issues', async ({
	page,
}) => {
	await page.goto('/blog')
	await page
		.getByText(
			'Create beautiful cross-page animations with the View Transitions API',
		)
		.click()
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})

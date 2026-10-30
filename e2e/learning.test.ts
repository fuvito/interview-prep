import { test, expect } from '@playwright/test'

test.describe('Learning flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Enter TypeScript topic list
    await page.getByText('TypeScript').click()
    // Click the Study button for the first topic (TypeScript Basics)
    await page.getByRole('button', { name: 'Study' }).first().click()
  })

  test('shows a question with progress header', async ({ page }) => {
    await expect(page.getByText('1 /')).toBeVisible()
  })

  test('shows answer options for a choice question', async ({ page }) => {
    // The first TypeScript Basics question is a single-choice question
    await expect(page.locator('div.space-y-2 button').first()).toBeVisible()
  })

  test('submit button is disabled until an option is selected', async ({ page }) => {
    await page.locator('div.space-y-2 button').first().waitFor()
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  test('selecting an option enables the submit button', async ({ page }) => {
    await page.locator('div.space-y-2 button').first().click()
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
  })

  test('submitting an answer reveals the explanation', async ({ page }) => {
    await page.locator('div.space-y-2 button').first().click()
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Explanation')).toBeVisible()
  })

  test('correct answer shows "Correct"', async ({ page }) => {
    // The correct answer for ts-basics-001 is option "a" — the first option
    await page.locator('div.space-y-2 button').first().click()
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Correct').first()).toBeVisible()
  })

  test('stop studying button goes back to topics', async ({ page }) => {
    await page.locator('button', { hasText: /Stop studying/ }).click()
    // Back at the topics view — Practice Interview button is visible there
    await expect(page.getByText('Practice Interview')).toBeVisible()
  })
})

test.describe('Learning flow — navigation', () => {
  test('Prev button is disabled on the first question', async ({ page }) => {
    await page.goto('/')
    await page.getByText('TypeScript').click()
    await page.getByRole('button', { name: 'Study' }).first().click()
    await expect(page.getByRole('button', { name: '← Prev' })).toBeDisabled()
  })
})

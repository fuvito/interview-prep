import { test, expect } from '@playwright/test'

test.describe('Interview setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('TypeScript').click()
    await page.getByText('Practice Interview').first().click()
  })

  test('shows topic checkboxes and question count options', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Topics' })).toBeVisible()
    await expect(page.getByRole('button', { name: '5', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '10', exact: true })).toBeVisible()
  })

  test('shows how many questions are available', async ({ page }) => {
    await expect(page.getByText(/questions available/)).toBeVisible()
  })

  test('Start Interview button is enabled when questions are available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Start Interview/ })).toBeEnabled()
  })

  test('selecting a question count updates the Start button label', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click()
    await expect(page.getByRole('button', { name: /Start Interview \(5 questions\)/ })).toBeVisible()
  })
})

test.describe('Interview flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('TypeScript').click()
    await page.getByText('Practice Interview').first().click()
    await page.getByRole('button', { name: '5', exact: true }).click()
    await page.getByRole('button', { name: /Start Interview/ }).click()
  })

  test('shows the question counter in the header', async ({ page }) => {
    await expect(page.getByText(/Question 1 of/)).toBeVisible()
  })

  test('hides the back button during an interview', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Go back' })).not.toBeVisible()
  })

  test('shows answer options for the first question', async ({ page }) => {
    await expect(page.locator('div.space-y-2 button').first()).toBeVisible()
  })

  test('Submit Answer button is disabled until an option is selected', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Submit Answer' })).toBeDisabled()
  })

  test('selecting an option enables Submit Answer', async ({ page }) => {
    await page.locator('div.space-y-2 button').first().click()
    await expect(page.getByRole('button', { name: 'Submit Answer' })).toBeEnabled()
  })

  test('submitting an answer shows a confirmation message and Next button', async ({ page }) => {
    await page.locator('div.space-y-2 button').first().click()
    await page.getByRole('button', { name: 'Submit Answer' }).click()
    await expect(page.getByText(/Answer recorded/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible()
  })

  test('clicking Stop interview shows a confirmation dialog', async ({ page }) => {
    await page.locator('button', { hasText: /Stop interview/ }).click()
    await expect(page.getByText('Stop this interview?')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stop', exact: true })).toBeVisible()
  })

  test('Continue in stop dialog dismisses the dialog and resumes', async ({ page }) => {
    await page.locator('button', { hasText: /Stop interview/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Stop this interview?')).not.toBeVisible()
    await expect(page.getByText(/Question 1 of/)).toBeVisible()
  })

  test('Stop in confirmation dialog ends the interview and shows back button', async ({ page }) => {
    await page.locator('button', { hasText: /Stop interview/ }).click()
    await page.getByRole('button', { name: 'Stop', exact: true }).click()
    // After stopping, we're back to a non-interview view — back button should be visible
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
  })
})

test.describe('Interview completion', () => {
  test('finishing all questions navigates to Results', async ({ page }) => {
    await page.goto('/')
    await page.getByText('TypeScript').click()
    await page.getByText('Practice Interview').first().click()
    await page.getByRole('button', { name: '5', exact: true }).click()
    await page.getByRole('button', { name: /Start Interview/ }).click()

    // Answer and advance through all 5 questions
    for (let i = 0; i < 5; i++) {
      await page.locator('div.space-y-2 button').first().click()
      await page.getByRole('button', { name: 'Submit Answer' }).click()
      const isLast = i === 4
      await page.getByRole('button', { name: isLast ? 'Finish Interview' : 'Next →' }).click()
    }

    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  })
})

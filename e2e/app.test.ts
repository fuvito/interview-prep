import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows the InterviewPrep branding', async ({ page }) => {
    await expect(page.getByText('InterviewPrep').first()).toBeVisible()
  })

  test('shows the TypeScript subject card', async ({ page }) => {
    await expect(page.getByText('TypeScript')).toBeVisible()
  })

  test('shows bottom navigation with all tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Subjects' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Bookmarks' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('navigates to Subjects via bottom nav', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Subjects' }).click()
    await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible()
  })

  test('goes back from Topics to Dashboard', async ({ page }) => {
    await page.goto('/')
    // Clicking a subject card uses navigate() (stack push), so the back button appears
    await page.getByText('TypeScript').click()
    await page.getByRole('button', { name: 'Go back' }).click()
    // After going back, the back button should be gone (we're at a root view again)
    await expect(page.getByRole('button', { name: 'Go back' })).not.toBeVisible()
    // Bottom nav is only shown at root views
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
  })

  test('navigates to About view', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'About' }).click()
    await expect(page.getByText('Fuat Yazar')).toBeVisible()
    await expect(page.getByText('MIT', { exact: true })).toBeVisible()
  })

  test('navigates to Progress view', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Progress' }).click()
    await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible()
  })

  test('navigates to Bookmarks view', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Bookmarks' }).click()
    await expect(page.getByRole('heading', { name: 'Bookmarks' })).toBeVisible()
  })

  test('navigates into TypeScript topics', async ({ page }) => {
    await page.goto('/')
    await page.getByText('TypeScript').click()
    await expect(page.getByText('Basics')).toBeVisible()
  })
})

test.describe('Theme toggle', () => {
  test('toggles light mode on and off', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/light-mode/)
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(html).toHaveClass(/light-mode/)
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(html).not.toHaveClass(/light-mode/)
  })
})

test.describe('Font size controls', () => {
  test('increase and decrease font size buttons are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Increase font size' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decrease font size' })).toBeVisible()
  })

  test('decrease button becomes disabled at minimum font size', async ({ page }) => {
    await page.goto('/')
    // Default is md; click down twice to reach xs (minimum: xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
    await page.getByRole('button', { name: 'Decrease font size' }).click()
    await page.getByRole('button', { name: 'Decrease font size' }).click()
    await expect(page.getByRole('button', { name: 'Decrease font size' })).toBeDisabled()
  })

  test('increase button becomes disabled at maximum font size', async ({ page }) => {
    await page.goto('/')
    // Default is md; click up 5 times to reach 4xl (maximum)
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Increase font size' }).click()
    }
    await expect(page.getByRole('button', { name: 'Increase font size' })).toBeDisabled()
  })
})

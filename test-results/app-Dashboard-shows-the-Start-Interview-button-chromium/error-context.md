# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.test.ts >> Dashboard >> shows the Start Interview button
- Location: e2e\app.test.ts:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /start interview/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /start interview/i }) with timeout 5000ms
  - waiting for getByRole('button', { name: /start interview/i })

```

```yaml
- banner:
  - text: IP InterviewPrep
  - button "About"
  - button "Decrease font size": A
  - button "Increase font size": A
  - button "Toggle theme"
  - button "Open in full window"
- main:
  - heading "Overall Progress" [level=2]
  - paragraph: "155"
  - paragraph: Questions
  - paragraph: "0"
  - paragraph: Attempted
  - paragraph: 0%
  - paragraph: Score
  - heading "Subjects" [level=2]
  - button "TypeScript 155 questions":
    - paragraph: TypeScript
    - paragraph: 155 questions
- navigation:
  - button "Home"
  - button "Subjects"
  - button "Progress"
  - button "Bookmarks"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Dashboard', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/')
  6  |   })
  7  | 
  8  |   test('shows the InterviewPrep branding', async ({ page }) => {
  9  |     await expect(page.getByText('InterviewPrep')).toBeVisible()
  10 |   })
  11 | 
  12 |   test('shows the Start Interview button', async ({ page }) => {
> 13 |     await expect(page.getByRole('button', { name: /start interview/i })).toBeVisible()
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  14 |   })
  15 | 
  16 |   test('shows the Study button', async ({ page }) => {
  17 |     await expect(page.getByRole('button', { name: /study/i })).toBeVisible()
  18 |   })
  19 | })
  20 | 
  21 | test.describe('Navigation', () => {
  22 |   test('navigates to subjects from Study', async ({ page }) => {
  23 |     await page.goto('/')
  24 |     await page.getByRole('button', { name: /study/i }).click()
  25 |     await expect(page.getByText('Subjects')).toBeVisible()
  26 |   })
  27 | 
  28 |   test('goes back from subjects to dashboard', async ({ page }) => {
  29 |     await page.goto('/')
  30 |     await page.getByRole('button', { name: /study/i }).click()
  31 |     await page.getByRole('button', { name: /go back/i }).click()
  32 |     await expect(page.getByText('InterviewPrep')).toBeVisible()
  33 |   })
  34 | 
  35 |   test('navigates to About view', async ({ page }) => {
  36 |     await page.goto('/')
  37 |     await page.getByRole('button', { name: /about/i }).click()
  38 |     await expect(page.getByText('Fuat Yazar')).toBeVisible()
  39 |     await expect(page.getByText('MIT')).toBeVisible()
  40 |   })
  41 | 
  42 |   test('navigates to Progress view', async ({ page }) => {
  43 |     await page.goto('/')
  44 |     await page.getByRole('button', { name: /progress/i }).click()
  45 |     await expect(page.getByText('Progress')).toBeVisible()
  46 |   })
  47 | 
  48 |   test('navigates to Bookmarks view', async ({ page }) => {
  49 |     await page.goto('/')
  50 |     await page.getByRole('button', { name: /bookmark/i }).click()
  51 |     await expect(page.getByText('Bookmarks')).toBeVisible()
  52 |   })
  53 | })
  54 | 
  55 | test.describe('Theme toggle', () => {
  56 |   test('toggles light mode on and off', async ({ page }) => {
  57 |     await page.goto('/')
  58 |     const html = page.locator('html')
  59 |     await expect(html).not.toHaveClass(/light-mode/)
  60 |     await page.getByRole('button', { name: /toggle theme/i }).click()
  61 |     await expect(html).toHaveClass(/light-mode/)
  62 |     await page.getByRole('button', { name: /toggle theme/i }).click()
  63 |     await expect(html).not.toHaveClass(/light-mode/)
  64 |   })
  65 | })
  66 | 
  67 | test.describe('Font size controls', () => {
  68 |   test('increase font size button is visible', async ({ page }) => {
  69 |     await page.goto('/')
  70 |     await expect(page.getByRole('button', { name: /increase font size/i })).toBeVisible()
  71 |   })
  72 | 
  73 |   test('decrease font size button is disabled at minimum', async ({ page }) => {
  74 |     await page.goto('/')
  75 |     // Decrease twice to reach minimum
  76 |     await page.getByRole('button', { name: /decrease font size/i }).click()
  77 |     await page.getByRole('button', { name: /decrease font size/i }).click()
  78 |     await expect(page.getByRole('button', { name: /decrease font size/i })).toBeDisabled()
  79 |   })
  80 | })
  81 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.test.ts >> Navigation >> navigates to subjects from Study
- Location: e2e\app.test.ts:22:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /study/i })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: IP
      - generic [ref=e8]: InterviewPrep
    - generic [ref=e9]:
      - button "About" [ref=e10]
      - button "Decrease font size" [ref=e13]: A
      - button "Increase font size" [ref=e14]: A
      - button "Toggle theme" [ref=e15]
      - button "Open in full window" [ref=e22]
  - main [ref=e28]:
    - generic [ref=e29]:
      - generic [ref=e30]:
        - heading "Overall Progress" [level=2] [ref=e31]
        - generic [ref=e32]:
          - generic [ref=e33]:
            - paragraph [ref=e34]: "155"
            - paragraph [ref=e35]: Questions
          - generic [ref=e36]:
            - paragraph [ref=e37]: "0"
            - paragraph [ref=e38]: Attempted
          - generic [ref=e39]:
            - paragraph [ref=e40]: 0%
            - paragraph [ref=e41]: Score
      - generic [ref=e44]:
        - heading "Subjects" [level=2] [ref=e45]
        - button [ref=e47]:
          - generic [ref=e48]:
            - paragraph [ref=e49]: TypeScript
            - paragraph [ref=e50]: 155 questions
  - navigation [ref=e53]:
    - button "Home" [ref=e54]
    - button "Subjects" [ref=e58]
    - button "Progress" [ref=e61]
    - button "Bookmarks" [ref=e63]
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
  13 |     await expect(page.getByRole('button', { name: /start interview/i })).toBeVisible()
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
> 24 |     await page.getByRole('button', { name: /study/i }).click()
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
import { expect, test } from '@playwright/test'

test('user registers and admin sees the record', async ({ browser, page }) => {
  const unique = Date.now()
  const name = `E2E User ${unique}`
  const email = `e2e-${unique}@example.com`
  const password = 'TestPassword123!'

  await page.goto('/')
  await page.getByLabel('Full name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Phone').fill('+66812345678')
  await page.getByLabel('Password').fill(password)
  await page.getByLabel('Organization').fill('E2E Org')
  await page.getByRole('button', { name: 'Submit Registration' }).click()

  await expect(page.getByText('Registration Confirmed')).toBeVisible()
  const referenceCode = (await page
    .locator('div.font-mono')
    .textContent()) as string
  expect(referenceCode.trim()).toMatch(/^[A-Z0-9]{10}$/)

  await page.getByRole('link', { name: 'Go to login' }).click()
  await page.getByLabel('Reference code').fill(referenceCode.trim())
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Edit registration')).toBeVisible()

  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'change-me-before-use'
  const adminContext = await browser.newContext({
    httpCredentials: {
      username: adminUsername,
      password: adminPassword,
    },
  })
  const adminPage = await adminContext.newPage()

  await adminPage.goto('/admin')
  await expect(adminPage.getByText(name)).toBeVisible()
  await expect(adminPage.getByText(referenceCode.trim())).toBeVisible()
  await adminContext.close()
})

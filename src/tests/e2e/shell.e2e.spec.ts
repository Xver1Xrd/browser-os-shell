import { expect, test } from '@playwright/test'

type AppId = 'explorer' | 'editor' | 'images' | 'terminal' | 'settings' | 'about'

async function openAppFromStart(page: import('@playwright/test').Page, appId: AppId) {
  await page.getByRole('button', { name: 'Start' }).click()
  const startMenu = page.getByTestId('start-menu')
  await expect(startMenu).toBeVisible()
  await startMenu.getByTestId(`start-app-${appId}`).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('open app from launcher', async ({ page }) => {
  await openAppFromStart(page, 'explorer')
  await expect(page.getByTestId('explorer-app')).toBeVisible()
})

test('move and resize window', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Desktop-only window resize test')

  await openAppFromStart(page, 'terminal')

  const windowLocator = page.locator('[data-app-id="terminal"]').first()
  await expect(windowLocator).toBeVisible()

  const header = windowLocator.locator('header').first()
  const beforeMove = await windowLocator.boundingBox()
  const headerBox = await header.boundingBox()

  if (!beforeMove || !headerBox) {
    test.fail(true, 'Window bounding boxes are unavailable')
    return
  }

  await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + headerBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(headerBox.x + headerBox.width / 2 + 120, headerBox.y + headerBox.height / 2 + 80)
  await page.mouse.up()

  const afterMove = await windowLocator.boundingBox()
  expect(afterMove?.x).not.toBe(beforeMove.x)

  const handle = windowLocator.getByTestId('resize-bottom-right')
  const handleBox = await handle.boundingBox()
  const beforeResize = await windowLocator.boundingBox()

  if (!handleBox || !beforeResize) {
    test.fail(true, 'Resize handle bounding box is unavailable')
    return
  }

  await page.mouse.move(handleBox.x + 2, handleBox.y + 2)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + 80, handleBox.y + 60)
  await page.mouse.up()

  const afterResize = await windowLocator.boundingBox()
  expect((afterResize?.width ?? 0) > beforeResize.width).toBeTruthy()
})

test('create folder in explorer and open text file then save', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Desktop-only editor flow')

  await openAppFromStart(page, 'explorer')
  const explorer = page.getByTestId('explorer-app')
  await expect(explorer).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.accept('E2EFolder')
  })
  await explorer.getByRole('button', { name: 'New Folder' }).click()
  await expect(explorer.locator('tbody td').filter({ hasText: 'E2EFolder' }).first()).toBeVisible()

  await openAppFromStart(page, 'editor')

  const editor = page.getByTestId('editor-app').first()
  await expect(editor).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.accept('e2e-note.txt')
  })
  const textarea = editor.getByRole('textbox')
  await textarea.fill('updated from e2e')
  await editor.getByRole('button', { name: 'Save', exact: true }).click()

  await expect(editor.getByText('e2e-note.txt')).toBeVisible()
})

test('mobile viewport smoke', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only smoke test')

  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText('Applications')).toBeVisible()
})

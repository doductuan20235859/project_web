import { expect, test } from '@playwright/test';

test('tạo nhân vật và giữ nguyên sau khi tải lại trang', async ({ page }) => {
  const name = 'Minh thử nghiệm';
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Tên của bạn' }).fill(name);
  await page.getByRole('button', { name: 'Bắt đầu hành trình' }).click();

  await expect(page.getByRole('heading', { level: 1, name: new RegExp(name) })).toBeVisible();
  await expect(page.getByText('Tiền đang có', { exact: true })).toBeVisible();
  await expect(page.getByText('Lương chờ nhận', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(name) })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Tên của bạn' })).toHaveCount(0);

  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(fitsViewport).toBe(true);
});

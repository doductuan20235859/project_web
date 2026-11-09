import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __workbenchStorageCalls: string[];
  }
}

test('fixture đổi độc lập và luôn qua kiểm tra invariants', async ({ page }) => {
  await page.goto('/workbench.html');
  await expect(page.getByTestId('workbench-phase')).toHaveText('planning');
  await expect(page.getByTestId('workbench-day')).toHaveText('1');

  for (const fixture of ['review-day-1', 'planning-day-2', 'poor-planning', 'exhausted-planning', 'pending-event']) {
    await page.getByLabel('Fixture', { exact: true }).selectOption(fixture);
    await expect(page.getByTestId('workbench-invariants')).toHaveText('Hợp lệ');
  }

  await expect(page.getByTestId('workbench-phase')).toHaveText('event');
  await expect(page.getByTestId('pending-event-slot')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thực thi mẫu EXECUTE_DAY' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Thực thi mẫu ACK_DAY' })).toBeDisabled();

  await page.reload();
  await expect(page.getByTestId('workbench-phase')).toHaveText('planning');
  await expect(page.getByTestId('workbench-day')).toHaveText('1');
});

test('lưu đang chờ và lưu lỗi không công bố snapshot ứng viên', async ({ page }) => {
  await page.goto('/workbench.html');
  const initialRevision = await page.getByTestId('workbench-revision').textContent();
  await page.getByLabel('Kịch bản lưu trong bộ nhớ').selectOption('hold');
  await page.getByRole('button', { name: 'Thực thi mẫu EXECUTE_DAY' }).click();
  await expect(page.getByTestId('workbench-status')).toHaveText('saving');
  await expect(page.getByTestId('workbench-phase')).toHaveText('planning');
  await expect(page.getByTestId('workbench-revision')).toHaveText(initialRevision ?? '');
  await expect(page.getByRole('button', { name: 'Thực thi mẫu EXECUTE_DAY' })).toBeDisabled();

  await page.getByRole('button', { name: 'Làm lỗi lần lưu đang chờ' }).click();
  await expect(page.getByTestId('workbench-status')).toHaveText('error');
  await expect(page.getByRole('alert')).toContainText('Lỗi lưu mô phỏng');
  await expect(page.getByTestId('workbench-revision')).toHaveText(initialRevision ?? '');
  await expect(page.getByTestId('workbench-phase')).toHaveText('planning');

  await page.getByLabel('Kịch bản lưu trong bộ nhớ').selectOption('success');
  await page.getByRole('button', { name: 'Thực thi mẫu EXECUTE_DAY' }).click();
  await expect(page.getByTestId('workbench-phase')).toHaveText('review');
  await expect(page.getByTestId('workbench-invariants')).toHaveText('Hợp lệ');
  await page.getByRole('button', { name: 'Thực thi mẫu ACK_DAY' }).click();
  await expect(page.getByTestId('workbench-phase')).toHaveText('planning');
  await expect(page.getByTestId('workbench-day')).toHaveText('2');
});

test('workbench không mở IndexedDB hoặc gọi Web Storage', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    window.__workbenchStorageCalls = calls;
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      get() {
        calls.push('indexedDB');
        throw new Error('Workbench không được truy cập IndexedDB.');
      },
    });
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;
    Storage.prototype.getItem = function (key: string) {
      calls.push(`getItem:${key}`);
      return originalGetItem.call(this, key);
    };
    Storage.prototype.setItem = function (key: string, value: string) {
      calls.push(`setItem:${key}`);
      originalSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function (key: string) {
      calls.push(`removeItem:${key}`);
      originalRemoveItem.call(this, key);
    };
    Storage.prototype.clear = function () {
      calls.push('clear');
      originalClear.call(this);
    };
  });

  await page.goto('/workbench.html');
  await page.getByRole('button', { name: 'Thực thi mẫu EXECUTE_DAY' }).click();
  await expect(page.getByTestId('workbench-phase')).toHaveText('review');
  await page.getByRole('button', { name: 'Thực thi mẫu ACK_DAY' }).click();
  await page.getByLabel('Fixture', { exact: true }).selectOption('pending-event');
  await expect(page.getByTestId('workbench-phase')).toHaveText('event');

  const calls = await page.evaluate(
    () => window.__workbenchStorageCalls,
  );
  expect(calls).toEqual([]);
});

# Kiểm thử trình duyệt

## Hai bộ kiểm tra baseline

| Lệnh | Phạm vi được kiểm chứng |
|---|---|
| `npm run test:e2e` | Ứng dụng chính sau build. Desktop/mobile Chromium kiểm tra tạo nhân vật và tải lại bản lưu qua IndexedDB thật. |
| `npm run test:workbench` | Trang workbench trên dev server. Chromium kiểm tra các phase và thao tác với state, luật và executor mẫu. |

Vitest chạy cả unit/integration của bộ khung và kiểm tra contract fixture trong `tests/contracts/`. Baseline chỉ xác nhận các hành vi trên. Luồng gameplay ngày đầu bằng engine và session thật được kiểm tra riêng ở [issue tích hợp #19](https://github.com/doductuan20235859/project_web/issues/19).

## Chạy lại ở máy local

Chạy trong `game/` với Node.js 24. Trên Linux cần cài thêm thư viện trình duyệt bằng `npx playwright install --with-deps chromium`.

```powershell
npm ci
npm run typecheck
npm run lint
npm run validate:content
npm test
npm run build
npx playwright install chromium
```

Chọn lệnh tương ứng với job bị lỗi. Mỗi lần chạy ghi báo cáo vào `playwright-report/` và trace lỗi vào `test-results/`. Mở báo cáo trước khi chạy bộ tiếp theo nếu cần giữ kết quả của lần trước.

```powershell
npm run test:e2e -- --reporter=list,html --workers=1 --fail-on-flaky-tests
npm run test:workbench -- --reporter=list,html --workers=1 --fail-on-flaky-tests
npx playwright show-report playwright-report
```

## Đọc lỗi trên GitHub Actions

**Game CI** chạy khi có PR vào `develop` và khi `develop` nhận commit. Mở tab **Checks** trên PR và chọn job bị lỗi. Các bước cài đặt, kiểm tra kiểu, lint, kiểm tra content, Vitest và build ghi log trực tiếp ở job tương ứng.

Hai job trình duyệt xuất artifact riêng `playwright-e2e` và `playwright-workbench`. Tải artifact ở trang workflow run, giải nén và dùng `npx playwright show-report <đường-dẫn>/playwright-report` để mở báo cáo. Trace của bài thất bại có trong `test-results/`. Nếu lỗi xảy ra trước khi Playwright chạy, xem log bước cài đặt trong job.

# Developer workbench

Mở `/workbench.html` trên Vite dev server. Đây là công cụ phát triển UI, không phải luồng game production.

- Entry riêng `game/workbench.html`, không được thêm vào input build production.
- Chỉ dùng fixture ở `src/testing/day-fixtures.ts` và state React trong bộ nhớ.
- Không import `App`, `bootstrap`, `GameSession`, repository hoặc production store.
- `GameDashboard` hiện tại chỉ là tham chiếu bố cục; nhãn lưu thật được ẩn trong workbench.
- Chuyển fixture luôn tạo snapshot mới. Tải lại trang trở về planning ngày 1.
- Fake executor chỉ chuyển trạng thái theo kịch bản viết sẵn; không kiểm chứng luật gameplay hoặc persistence thật.

## Gắn component của job UI

Sửa duy nhất `slots.tsx` để đăng ký `activityPanel(context)` và `dayReview(context)`. Context gồm:

- `state`: snapshot fixture hiện tại.
- `activityOptions`: các hoạt động mẫu và trạng thái khóa.
- `status`, `error`: trạng thái ready/saving/error trong bộ nhớ.
- `actions.executeDay(activityId)` và `actions.acknowledgeDay()`: trả `Promise<DayActionResult>`.

Kịch bản lưu `hold` chỉ hoàn tất khi nhấn nút điều khiển “Hoàn tất lần lưu đang chờ” hoặc “Làm lỗi lần lưu đang chờ”. Trong lúc chờ, UI vẫn nhận snapshot cũ. Kịch bản `failure` trả lỗi ngay và giữ state. Không dùng timer, random hoặc database.

Các nút mang tên `EXECUTE_DAY`/`ACK_DAY` là điều khiển tooling, không thay cho `ActivityPanel` và `DayReview` cần xây. Chúng cho phép kiểm tra slot/status trước khi feature UI hoàn thành.

## Kiểm chứng

Chạy `playwright test --config playwright.workbench.config.ts`. Bộ smoke riêng dùng Vite dev server; bộ E2E production tiếp tục dùng config hiện tại. Test workbench không được dùng làm bằng chứng game production đã thực hiện vòng ngày.

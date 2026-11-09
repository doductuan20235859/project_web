# Bộ khung game

## Framework và kiến trúc

React xây giao diện; TypeScript kiểm tra kiểu; Vite cung cấp dev server/build; Zustand giữ snapshot giao diện. Dexie làm việc với IndexedDB; Zod kiểm tra dữ liệu save tại runtime.

Kiến trúc chia lớp và nhóm giao diện theo tính năng:

```text
game/
├── src/
│   ├── app/              # Bootstrap, ghép dependencies, App và ErrorBoundary
│   ├── domain/           # Kiểu dữ liệu, command, condition/effect và invariants
│   ├── engine/           # Hàm mô phỏng thuần, khởi tạo, RNG và calendar
│   ├── content/          # Preset nhân vật, NPC, mục tiêu và dữ liệu chương
│   ├── application/      # GameSession, Zustand stores, selectors và ports
│   ├── infrastructure/   # IndexedDB, schema, save import/export, offline
│   ├── features/         # Character, dashboard và các tính năng theo roadmap
│   ├── shared/ui/        # Component giao diện dùng chung
│   └── styles/           # CSS tokens, global và responsive
├── public/               # Asset đóng gói cùng ứng dụng
├── scripts/              # Kiểm tra content
├── tests/
│   ├── engine/           # Tính xác định và trạng thái khởi tạo
│   ├── persistence/      # Save/load, schema và transaction
│   ├── fixtures/         # Save và dữ liệu tái hiện lỗi
│   └── e2e/              # Luồng trình duyệt
└── *.config.*            # Build, TypeScript, ESLint, Vitest, Playwright
```

Chiều gọi chính: `features → application → engine → domain`. Lớp `app` ghép repository cụ thể vào application; database không đi vào engine. `content` tuân theo contract domain và được truyền vào engine.

## Phạm vi hiện tại

- Contract cho state, character, command, condition/effect, sự kiện và save.
- Khởi tạo snapshot ngày 1 bằng seed; cả ba hoàn cảnh có cùng chỉ số khởi tạo.
- Form tạo nhân vật, hiển thị trạng thái ban đầu và tự tải lượt đã lưu.
- Lưu current/backup bằng IndexedDB, kiểm tra revision và validate runtime trước hydrate.
- Bộ kiểm tra kiểu, nội dung, test engine và test persistence.

Các con số preset là dữ liệu thử nghiệm của bộ khung, chưa phải cân bằng gameplay được duyệt. Chưa có thực thi hoạt động/ngày, chuỗi sự kiện, tổng kết 30 ngày, giao diện quản lý save hay service worker. Các thư mục dành cho chúng có README mô tả trách nhiệm và bước tiếp theo; không cung cấp nút tương tác giả.

## Chạy và kiểm tra

Cần Node.js 24 trở lên. Sau khi clone, dùng `npm ci` để cài đúng lockfile.

```powershell
npm run dev
npm run typecheck
npm run validate:content
npm test
npm run lint
npm run build
```

`npm run preview` phục vụ build tại `http://127.0.0.1:4173`. Mã nguồn đang cấu hình host loopback; không tự mở ra mạng LAN.

Kiểm tra trình duyệt khi cần:

```powershell
npx playwright install chromium
npm run test:e2e
```

Có thể dùng Chrome đã cài thay cho tải Chromium: đặt `$env:PLAYWRIGHT_CHANNEL = 'chrome'` trước khi chạy E2E trên PowerShell.

Nếu Node chưa có trong PATH, dùng launcher `../run.ps1` ở thư mục dự án; xem [README gốc](../README.md).

## Quy ước phát triển

- UI gửi yêu cầu qua `GameSession`, không sửa trực tiếp tiền/chỉ số trong store.
- Chỉ publish state sau khi save commit; gặp save hỏng không tạo state mặc định ghi đè.
- Engine không đọc DOM, database, đồng hồ hệ thống hoặc `Math.random()`.
- Seed, phase, revision và phiên bản nội dung/luật nằm trong snapshot.
- Giữ ID nội dung ổn định; tăng schema và viết migration thật khi hình dạng save thay đổi.
- Thêm module có người dùng và kiểm chứng cụ thể; không tạo sẵn hàng loạt hàm rỗng.

## Bước triển khai tiếp theo

Chốt bảng balance và lịch ca làm, sau đó triển khai `EXECUTE_DAY` và `ACK_DAY` thành một vòng ngày. Nối một sự kiện có điều kiện/hậu quả trễ để hoàn thành lát cắt ba ngày trong [kế hoạch](../docs/KE_HOACH_KIEN_TRUC_VA_BASE_CODE.md).

## Làm việc song song

[Phân công 3 Job cho 5 người](../docs/PHAN_CONG_SONG_SONG.md) là backlog triển khai tiếp theo; [WORKFLOW](../docs/WORKFLOW.md) quy định nhánh và review.

- `src/domain/model/day-rules.ts` và `day-view.ts`: contract luật và danh sách hoạt động.
- `src/application/ports/command-executor.ts` và `day-actions.ts`: điểm nối engine/session/UI.
- `src/testing/day-fixtures.ts`: state, rules và executor kiểm thử; không dùng làm gameplay thật.
- `src/workbench/`: sandbox phát triển, không đọc/ghi save. Chạy `npm run dev:workbench`, mở `http://127.0.0.1:5174/workbench.html`.
- `npm run test:workbench`: kiểm tra sandbox độc lập với engine/session đang triển khai.

Mỗi Job 1 có thể nghiệm thu bằng contract/fixture của mình. Luồng thật được ghép trong issue tích hợp riêng. Không thay `GameState`/save schema 1 chỉ để phục vụ mock; `DaySummary` hiện có `day` và `message`.

Workbench là entry dành cho Vite dev. `npm run build` chỉ đóng gói `index.html`; App không import fixture hoặc workbench. Các số trong fixture là ví dụ cố định để kiểm thử, không phải balance production.

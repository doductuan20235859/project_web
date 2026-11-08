# Nhật Ký Đi Nhật — Hành Trình Tha Hương

Game web mô phỏng cuộc sống, lựa chọn và hậu quả dành cho trình duyệt PC/mobile.

- [GDD](<# GAME DESIGN DOCUMENT (GDD).txt>): thiết kế gameplay gốc.
- [Kế hoạch kiến trúc và triển khai](docs/KE_HOACH_KIEN_TRUC_VA_BASE_CODE.md): phạm vi MVP và roadmap.
- [Ứng dụng trong game/](game/README.md): hướng dẫn chạy và cấu trúc source.

## Công nghệ

React + TypeScript, Vite, Zustand, IndexedDB/Dexie và Zod. Engine là TypeScript thuần, tách khỏi React và database.

## Chạy bộ khung

Nếu máy có Node.js 24 trở lên:

```powershell
cd D:\project_web\game
npm ci
npm run dev
```

Workspace này cũng có Node portable trong `.tools/` (không đưa vào Git). Script sau tìm Node trên máy hoặc bản portable rồi chạy ứng dụng:

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1 dev
```

Lệnh trên chỉ áp dụng ExecutionPolicy cho tiến trình chạy script. Mở địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173`.

Bộ khung hiện tập trung cấu trúc source, tạo nhân vật và lưu/tải cục bộ. Vòng ngày, sự kiện phân nhánh, cân bằng gameplay và PWA nằm ở các mốc tiếp theo.

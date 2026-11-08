# Hệ thống gameplay sẽ triển khai sau bộ khung

Thư mục này dành cho các luật thuần TypeScript trong giai đoạn kế tiếp:

- `activities.ts`: điều kiện, chi phí và tác động của hoạt động.
- `economy.ts`: lương tích lũy, kỳ trả lương, nghĩa vụ và ledger.
- `wellbeing.ts`: thể lực, sức khỏe, stress, rủi ro trước giấc ngủ.
- `relationships.ts`: quan hệ riêng cho từng NPC.
- `story.ts`, `scheduler.ts`: lựa chọn, event instance và hậu quả trễ.
- `goals.ts`: đánh giá chương theo mục tiêu.

Bộ khung hiện chỉ khởi tạo nhân vật và state hợp lệ. Chưa có vòng ngày,
thực thi command, event engine, công thức lương hoặc chấm điểm tổng kết.
Khi bổ sung, các hệ thống phải trả state mới và không gọi UI, storage,
đồng hồ thiết bị hoặc `Math.random()`.

# Dữ liệu và adapter kiểm thử dùng chung

Các export trong `day-fixtures.ts` chỉ dùng từ test và workbench. Không import
chúng vào `app/bootstrap.ts`, giao diện production, session hoặc engine thật.

- Factory trả JSON state mới theo schema 1, không chia sẻ object/array giữa lần gọi.
- `makeReviewDay1` là oracle viết sẵn, không gọi engine để tạo kết quả mong đợi.
- `DaySummary` giữ đúng `{ day, message }`; không có breakdown ẩn ngoài save contract.
- `fixtureGameplayContent` chứa số tổng hợp cho việc kiểm tra contract. Người phụ
  trách gameplay vẫn phải cung cấp và nghiệm thu luật production riêng.
- `fixtureExecutor` chỉ chuyển giữa snapshot mẫu ngày 1, event mẫu và ngày 2.
  Nó không tính kết quả cho từng hoạt động; mọi thông báo đều ghi rõ đây là mẫu.
  Phiên bản fixture riêng giúp adapter từ chối state production.

Ba ID hoạt động mẫu là `fixture-rest`, `fixture-study`, `fixture-overtime`.
Event mẫu có instance ID `fixture-event-1`, choice `continue` và `decline`.
Lương/chi phí/chỉ số trong snapshot review mô tả riêng đường học mẫu; chúng không
phải nghiệm thu cho engine thật khi người chơi chọn hoạt động khác.

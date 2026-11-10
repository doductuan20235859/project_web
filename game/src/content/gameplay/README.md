# Rules ngày — phần khởi đầu của issue #2

Phần hiện tại tương đương **khoảng 30% phạm vi ước lượng** của J1-RULES. Đây là mốc bàn giao dở dang có thể tiếp tục, không phải phần trăm được đo tự động hoặc issue đã hoàn thành.

## Đã có

- `activities.ts`: ba hoạt động tùy chọn `rest`, `study`, `overtime` theo `ActivityDefinition` của common base.
- `validate-activities.ts`: kiểm tra cơ bản ID, giá JPY, mức thể lực yêu cầu và số nguyên an toàn của các effect.
- `tests/content/activities.test.ts`: kiểm tra ý nghĩa catalog và những cấu hình sai quan trọng.

Các con số là **balance dự thảo cho gameplay**, cần người phụ trách xem lại. Làm thêm ghi vào `unpaidWagesDelta`; ca làm cơ bản chưa nằm trong catalog và không được áp dụng lặp qua hoạt động làm thêm.

## Còn lại để tiếp tục issue #2

1. Chốt lịch ca, ca cơ bản, payday và các giá trị `endOfDay` thành một `DayRules` hoàn chỉnh.
2. Ghép với registry thành `GameplayContent`; thống nhất phiên bản và chính sách tương thích save hiện có.
3. Bổ sung validator toàn bộ rules: ngày/lịch, xác suất, cấu hình nghỉ an toàn, nội dung hiển thị và các ràng buộc giữa các trường.
4. Viết bảng luật và ví dụ kết quả ngày đầu; chốt thứ tự rủi ro → trả lương → phí → phục hồi.
5. Nối vào lệnh kiểm tra content và thêm test lịch/cấu hình đầy đủ.

Catalog này chưa được nối vào bootstrap hoặc gameplay thật. `npm run validate:content` hiện vẫn kiểm tra registry ban đầu; kiểm tra phần mới bằng:

```text
npm test -- tests/content/activities.test.ts
```

Nhánh dựa trên common base của [PR #8](https://github.com/doductuan20235859/project_web/pull/8), đang chờ review. Khi base được merge, cập nhật `develop` và kiểm tra diff phần issue #2 trước khi chuyển PR của phần này sang Ready. Không đóng issue ở mốc khởi đầu này.

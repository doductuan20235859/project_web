# Lộ trình offline

Bộ khung hiện lưu nhân vật bằng IndexedDB. Chưa có service worker, precache hay cam kết tải lại ứng dụng khi mất mạng.

Ở giai đoạn MVP tiếp theo: thêm manifest và `vite-plugin-pwa`, đóng gói nội dung/ảnh/font tại chỗ, cache app shell, thông báo cập nhật tại điểm an toàn, rồi kiểm chứng reload không mạng trên build production. Cache ứng dụng và dữ liệu save phải có vòng đời riêng.

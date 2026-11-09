# Git workflow — Làm việc nhóm không hỗn loạn

Áp dụng cho nhóm 5 người của **Nhật Ký Đi Nhật — Hành Trình Tha Hương**. GitHub Issues theo dõi công việc. Pull request (PR) dùng để review trước khi tích hợp vào `develop` và phát hành lên `main`.

## 1. Đầu mỗi đợt

1. Chốt một kết quả có thể demo và gom các issue liên quan vào cùng một milestone.
2. Chia công việc theo đầu ra. Mỗi issue có một người phụ trách, một tiêu chí nghiệm thu rõ ràng và liên kết đến issue phụ thuộc nếu có.
3. Chốt giao kèo giữa các phần làm song song. Với gameplay, thống nhất lệnh, trạng thái đầu vào, kết quả và lỗi trước khi tách phần engine, UI và lưu game.

## 2. Từ issue đến merge

| Trạng thái | Việc cần làm |
|---|---|
| **Todo** | Ghi mục tiêu, phạm vi, tiêu chí nghiệm thu và người phụ trách. Nếu phải chờ việc khác, ghi `Blocked by #12` trong issue. |
| **In Progress** | Cập nhật `develop`, tạo branch riêng và bắt đầu làm. Khi gặp vướng mắc, cập nhật ngay trên issue để người liên quan biết. |
| **In Review** | Mở PR vào `develop`, tham chiếu issue và chỉ định ít nhất một reviewer khác tác giả. Có thể mở Draft PR sớm để xin góp ý. |
| **Done** | Sau khi PR merge vào `develop` và đạt tiêu chí nghiệm thu, đóng issue thủ công và xóa branch tính năng. Nếu tiêu chí yêu cầu phát hành, đóng khi đã lên `main`. Với issue chỉ bàn giao nội dung trên GitHub, đóng sau khi người liên quan xác nhận kết quả. |

### Mẫu issue

**Tiêu đề mẫu** `Cho phép người chơi chốt ngày 1 từ màn hình lập kế hoạch`

```markdown
## Mục tiêu
Người chơi có thể làm gì sau khi issue hoàn thành?

## Phạm vi
- Công việc hoặc kết quả cụ thể cần bàn giao.

## Tiêu chí nghiệm thu
- [ ] Với dữ liệu đầu vào cụ thể, kết quả quan sát được là gì?
- [ ] Có thể kiểm tra kết quả bằng cách nào?

## Phụ thuộc
Ghi `Blocked by #<số issue>` nếu cần chờ một issue khác.
```

Gán người phụ trách bằng **Assignees** và chọn milestone ngay trên issue. Nếu một việc mới phát sinh nằm ngoài phạm vi, tạo issue riêng rồi liên kết lại.

## 3. Chiến lược branching

- **`main`** giữ bản ổn định để phát hành. Mỗi đợt phát hành đưa code lên bằng PR từ `develop`.
- **`develop`** là nhánh tích hợp và chạy thử các thay đổi của nhóm.
- **`feature/<số-issue>-<mô-tả-ngắn>`** là nhánh riêng cho từng công việc, kể cả sửa lỗi. Tách nhánh từ `develop` và mở PR về `develop`.

Mọi thay đổi trên `main` và `develop` đi qua PR. Cấm push trực tiếp và force push lên hai nhánh này. Nếu repo mới có `main`, người quản lý repo tạo `develop` từ `main` một lần trước khi nhóm bắt đầu.

Ví dụ làm issue số 12 từ PowerShell tại thư mục gốc của repo.

```powershell
git fetch origin
git switch -c feature/12-day-cycle origin/develop

# Sau khi triển khai và kiểm tra, stage các tệp cần đưa vào commit.
git add game/src/engine/day-cycle.ts
git commit -m "feat(engine): thêm vòng chơi ngày đầu"
git push -u origin feature/12-day-cycle
```

Sau khi push, mở PR với `base: develop` và `compare: feature/12-day-cycle`. Khi có xung đột, tác giả PR chạy `git fetch origin` rồi `git merge origin/develop` trên nhánh tính năng, trao đổi với người sửa cùng phần nếu cần và chạy lại kiểm tra sau khi giải quyết.

## 4. Định dạng commit message

```text
type(scope): mô tả ngắn gọn
```

`scope` là tùy chọn. Dùng tên phần thay đổi như `engine`, `ui`, `save` hoặc `content`. Có thể thêm phần giải thích sau một dòng trống nếu cần.

| Type | Khi dùng | Ví dụ |
|---|---|---|
| `feat` | Thêm tính năng | `feat(engine): thêm vòng chơi ngày đầu` |
| `fix` | Sửa lỗi | `fix(save): giữ đúng màn kết quả sau khi tải lại` |
| `docs` | Cập nhật tài liệu | `docs: hướng dẫn chạy game trên Windows` |
| `test` | Thêm hoặc sửa kiểm thử | `test(e2e): kiểm tra reload giữa ngày` |
| `refactor` | Tổ chức lại code và giữ nguyên hành vi | `refactor(ui): tách phần hiển thị chỉ số` |
| `chore` | Bảo trì dự án | `chore: cập nhật dependency kiểm thử` |

## 5. Quy trình pull request

1. Đặt tiêu đề theo định dạng commit. Giữ mỗi PR tập trung vào một kết quả có thể review và kiểm tra riêng.
2. Ghi thay đổi, lý do và cách test. Thêm ảnh hoặc video nếu thay đổi giao diện. Tham chiếu issue bằng `Refs #12` trong PR vào `develop`.
3. Chỉ merge sau khi có ít nhất một người khác duyệt, các kiểm tra liên quan đã qua và tiêu chí nghiệm thu đã được xác nhận. Nếu repo đã cấu hình CI, chờ các check bắt buộc chạy thành công.
4. Khi milestone đã nghiệm thu trên `develop`, mở PR `develop → main`, ghi các issue có trong bản phát hành và giữ nhánh `develop` sau khi merge. Với issue cần đợi phát hành mới đóng, dùng `Closes #12` trên PR vào `main` khi `main` là nhánh mặc định và repo bật tự đóng issue. [Cách GitHub liên kết và đóng issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)

### Mẫu mô tả PR

```markdown
## Issue
Refs #12

## Thay đổi
- Thêm bước xác nhận kết quả ngày 1 trước khi sang ngày 2.

## Tại sao
Người chơi cần xem kết quả của ngày vừa chơi trước khi tiếp tục.

## Cách test
1. Tạo nhân vật và chơi hết ngày 1.
2. Tải lại ở màn kết quả và kiểm tra ngày vẫn là ngày 1.
3. Bấm xác nhận và kiểm tra game chuyển sang ngày 2 đúng một lần.

## Checklist
- [ ] Đạt tiêu chí nghiệm thu trong issue.
- [ ] Đã chạy kiểm tra liên quan và ghi kết quả vào PR.
- [ ] Đã thêm ảnh hoặc video nếu thay đổi giao diện.
- [ ] Đã kiểm tra tệp commit để tránh đưa thông tin bí mật vào repo.
```

### Kiểm tra trước khi merge

Chạy từ `game/` với Node.js 24 trở lên. Cài dependency bằng `npm ci` khi mới clone hoặc khi lockfile thay đổi.

```powershell
npm run typecheck
npm run lint
npm test
```

- Khi sửa dữ liệu game, chạy thêm `npm run validate:content`.
- Khi sửa luồng chơi hoặc lưu/tải trên trình duyệt, chạy thêm `npm run test:e2e` sau khi [cài Chromium cho Playwright](../game/tests/e2e/README.md).
- Trước khi phát hành, chạy `npm run build` và demo luồng tích hợp trên `develop`.

Khi review code gameplay, kiểm tra UI gửi lệnh qua `GameSession`, engine tính luật chơi, và store chỉ nhận state mới sau khi lưu thành công. [Quy ước kỹ thuật của game](../game/README.md)

## 6. Đợt đầu · Chơi trọn ngày 1

**Demo nghiệm thu** — Tạo nhân vật → chọn hoạt động → xem kết quả ngày 1 → tải lại trang và vẫn thấy kết quả → xác nhận sang ngày 2 đúng một lần. Mốc này đi từ `planning` qua `review` rồi trở lại `planning` ở ngày 2.

| Người | Issue đề xuất | Tiêu chí nghiệm thu | Phối hợp |
|---|---|---|---|
| 1 | Chốt luật ngày đầu | Có lịch ca, hoạt động làm/học/nghỉ, điều kiện hợp lệ và mức thay đổi tiền, thể lực, XP. Phân biệt tiền có thể tiêu và lương chờ trả. | Chốt bảng luật với người 2 để engine có dữ liệu triển khai. |
| 2 | Triển khai `EXECUTE_DAY` và `ACK_DAY` | Lệnh hợp lệ đưa ngày 1 từ `planning` sang `review`. Xác nhận sang ngày 2 đúng một lần. Lệnh sai phase hoặc sai revision giữ nguyên state. | Chốt giao kèo với người 3 và 4 ngay đầu đợt. |
| 3 | Làm UI chọn hoạt động và xem kết quả | Người chơi chọn hoạt động, xem kết quả và xác nhận sang ngày mới. Giao diện hiển thị lỗi và trạng thái đang lưu. | Dựng bằng state mẫu, sau đó nối với `GameSession` của người 4. |
| 4 | Nối command vào `GameSession` và lưu game | Reload ở `review` quay lại đúng kết quả. Nếu ghi lỗi, giao diện giữ state đã lưu. Gửi lại lệnh cũ không áp dụng tác động lần hai. | Dùng contract đã chốt để làm phần lưu, tích hợp khi engine sẵn sàng. |
| 5 | Kiểm thử luồng ngày đầu | Có kịch bản đi từ tạo nhân vật đến ngày 2, gồm reload giữa chừng và thao tác lặp. Ghi lỗi với bước tái hiện và kết quả mong đợi. | Chuẩn bị kịch bản và dữ liệu kiểm thử trước, chạy E2E khi luồng đã nối. |

Trong buổi kickoff, chốt tên 5 người, tạo milestone và các issue trên GitHub, rồi thay các phụ thuộc bằng số issue thật. Ghi giao kèo `EXECUTE_DAY`/`ACK_DAY` ngay trong issue engine để cả nhóm dùng chung. [Kế hoạch vòng ngày và các mốc tiếp theo](KE_HOACH_KIEN_TRUC_VA_BASE_CODE.md)

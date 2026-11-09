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

## 6. Đợt đầu · Năm Job 1 song song và một demo tích hợp

Common base cung cấp types, port executor/actions, state fixture và developer workbench. Nó chưa thực thi ngày chơi trong ứng dụng chính. Sau khi contract này được review, cả năm người có thể hoàn tất PR module riêng mà không chờ implementation của nhau.

| Người | Issue Job 1 | Sản phẩm kiểm chứng độc lập |
|---|---|---|
| **doductuan** | [#2 — Rules/content](https://github.com/doductuan20235859/project_web/issues/2) | Dữ liệu luật ngày đúng contract và validator; không cần executor/UI thật |
| **DXKhai** | [#3 — Engine](https://github.com/doductuan20235859/project_web/issues/3) | Executor planning → review → planning ngày 2, kiểm tra phase/revision bằng rules fixture |
| **dhminh** | [#5 — UI](https://github.com/doductuan20235859/project_web/issues/5) | ActivityPanel/DayReview nhận props, demo trạng thái thường/khóa/lưu trong workbench |
| **kjfvnju** | [#4 — Session/save](https://github.com/doductuan20235859/project_web/issues/4) | Dispatch nhận executor được inject, commit rồi publish; test lỗi ghi/CAS bằng fake executor |
| **thanhpro82** | [#6 — QA/tools](https://github.com/doductuan20235859/project_web/issues/6) | CI, baseline E2E scaffold và kiểm tra workbench chạy ngay trên common base |

Mỗi Job 1 có thể Done khi PR vào `develop` đã được người khác duyệt, merge và đạt tiêu chí module. Test bằng fixture phải được ghi rõ, không đồng nghĩa demo gameplay thật đã đạt. Job 2/3 nối tiếp phần việc của từng owner; không thêm phụ thuộc chéo chỉ vì chưa có màn hình hoặc engine của người bên cạnh.

Tạo riêng issue **tích hợp ngày 1** do kjfvnju phụ trách sau khi #2/#3/#4/#5 có sản phẩm thật: ghép rules → executor → session → IndexedDB → component qua props. Demo nghiệm thu là tạo nhân vật → chọn hoạt động → review ngày 1 → reload vẫn review → xác nhận sang planning ngày 2 đúng một lần. DXKhai review, thanhpro82 kiểm chứng; bốn người còn lại có thể làm Job 2 trong lúc ghép. KJFVNJU giữ `app/bootstrap.ts` và integration container; DHMINH giữ `App.tsx`/component và giao điểm props.

Common-base PR cũng phải có reviewer khác tác giả và PR về `develop`; không tự merge để rút ngắn thời gian chờ. Trong lúc chờ common base, có thể làm nhánh tạm trên commit base và mở Draft PR về `develop`; phải đợi base được duyệt/merge, cập nhật `develop`, kiểm tra diff riêng và chạy lại checks trước khi Ready/merge. Những nhánh bắt đầu sau đó vẫn tách từ `develop` theo mục 3.

Xem [ma trận 3 Job × 5 người, paths/API và tiêu chí cụ thể](PHAN_CONG_SONG_SONG.md). Mã Job 2/3 trong tài liệu là mã kế hoạch; thay bằng link thật sau khi tạo issue. [Kế hoạch kiến trúc MVP](KE_HOACH_KIEN_TRUC_VA_BASE_CODE.md) vẫn mô tả đích dài hạn; không dùng fixture để tuyên bố event engine, offline hoặc toàn bộ 30 ngày đã hoàn thành.

# Phân công 3 Job cho nhóm 5 người

**Ngày cập nhật:** 09/11/2026  
**Nhánh tích hợp:** `develop`  
**Phạm vi:** xây vòng ngày, giao diện và lưu trữ trên bộ khung hiện có

## 1. Cách tổ chức công việc

Mỗi người có ba Job với đầu ra kiểm chứng riêng. Năm Job 1 dùng chung contract và fixture của common base; không Job 1 nào phải đợi code của bốn người còn lại. Job 2 tiếp nối Job 1 của cùng người, Job 3 tiếp nối Job 2. Các PR chức năng có thể merge khi kiểm chứng phần mình thành công; demo tích hợp thật có tiêu chí riêng.

Việc dùng fixture giúp kiểm tra một phần khi phần bên cạnh chưa hoàn thành. Kết quả đó chỉ chứng minh contract hoặc module tương ứng, không được ghi là người chơi đã đi trọn ngày bằng các module thật.

Đợt này ưu tiên ngày 1 rồi mở rộng kiểm chứng nhiều ngày, payday, lỗi lưu và bộ nhớ đệm offline. Gặp sự kiện đang chờ trong fixture dùng để kiểm tra UI/save; không đồng nghĩa đã có engine truyện phân nhánh. Ba Job chuẩn bị cơ chế tháng và độ ổn định, chưa phải toàn bộ cốt truyện MVP 30 ngày. Story/event engine cần issue riêng sau khi chốt contract.

## 2. Common base để cả nhóm bắt đầu

Common base được theo dõi tại [#7](https://github.com/doductuan20235859/project_web/issues/7), nhánh `feature/7-parallel-base`, [PR #8](https://github.com/doductuan20235859/project_web/pull/8) về develop. Nó bổ sung types, fixture và workbench, chưa thực thi gameplay ngày trong ứng dụng chính, chưa nối `GameSession` với một engine ngày thật và chưa đổi schema save. PR về `develop` phải có reviewer khác tác giả; đã yêu cầu DXKhai20235749 và kjfvnju review, chưa merge khi thiếu review.

| Đường dẫn trong `game/` | Giao kèo dùng chung |
|---|---|
| `src/domain/model/day-rules.ts` | `DayRules`, `GameplayContent`, `DayEffects`: đầu vào thuần dữ liệu cho luật ngày |
| `src/domain/model/day-view.ts` | `ActivityOption`: `id`, `name`, `description`, `available`, `unavailableReason`, `cashCost`, `effectLabels` |
| `src/application/ports/command-executor.ts` | `CommandExecutor(state, command) => EngineResult` và `ActivityOptionsProvider`; executor thật đóng gói rules/content bằng dependency injection |
| `src/application/ports/day-actions.ts` | `DayActions.executeDay`/`acknowledgeDay`; kết quả `{ ok: true }` hoặc `{ ok: false; message: string }` |
| `src/domain/model/command.ts` | `GameCommand`/`EngineResult` hiện có; command mang `commandId` và `expectedRevision` |
| `src/application/ports/save-repository.ts` | Save envelope và repository CAS hiện có |
| `src/testing/day-fixtures.ts` | Các factory `makePlanningDay1`, `makeReviewDay1`, `makePlanningDay2`, `makePoorPlanning`, `makeExhaustedPlanning`, `makePendingEvent`; cùng `fixtureGameplayContent`, `fixtureExecutor`, `fixtureActivityOptions` |
| `workbench.html`, `src/workbench/**` | Trang phát triển riêng, có slot `ReactNode` để cắm component; không thay ứng dụng chính |

Từ `game/`, dùng `npm run dev:workbench` để mở workbench tại port 5174 và `npm run test:workbench` để kiểm tra trang mẫu. Workbench phải ghi rõ đang dùng dữ liệu thử nghiệm. `fixtureExecutor` không được import vào bootstrap hoặc controller của ứng dụng chơi thật.

### Những điều giữ cố định

- Factory trả state riêng cho mỗi lần gọi; test không sửa một singleton fixture chung.
- Schema save vẫn là v1, kiểm tra strict. `turn.summary` giữ dạng `{ day, message }`; không tự thêm delta hoặc trường giao diện vào bản lưu.
- Chi tiết thay đổi được suy ra từ trước/sau hoặc đưa qua view model riêng. Sau reload, dùng `summary.message` đã lưu; không hứa khôi phục breakdown không có trong save. Khi thật sự phải đổi hình dạng save, mở PR contract/schema có migration và fixture tương thích.
- `rulesVersion`/`contentVersion` được kiểm tra khi load. Chỉ tăng phiên bản có chủ đích, ghi rõ tương thích; không đổi phiên bản tùy ý để vượt lỗi load.
- Rules/engine không gọi DOM, storage, đồng hồ máy hoặc `Math.random()` để quyết định gameplay.
- Điều kiện hiển thị lấy từ `ActivityOptionsProvider`; engine luôn kiểm tra lại command. UI không tự viết một bộ luật tiêu tiền/thể lực khác.
- Common base và fixture không được mỗi người tự sửa theo một hướng. Nếu contract thiếu, trao đổi trong issue và đưa một PR contract được review trước khi dùng chung.

## 3. Ma trận 3 Job × 5 người

Tất cả link dưới đây là issue thật đã tạo và gán Assignee trên GitHub: Job 1 ở #2–#6, Job 2 ở #9–#13, Job 3 ở #14–#18; #19 và #20 là hai gate tích hợp. Các mã J1/J2/J3 dùng để nhận diện phạm vi, không phải thứ tự chờ toàn nhóm.

| Owner | Job 1 — độc lập trên common base | Job 2 — nối tiếp phần mình | Job 3 — hoàn thiện và kiểm chứng |
|---|---|---|---|
| **doductuan20235859** — rules/content | [#2](https://github.com/doductuan20235859/project_web/issues/2): rules ngày và validator, **6 giờ** | [#9 — J2-RULES](https://github.com/doductuan20235859/project_web/issues/9): ca/nghỉ, payday/chi phí và validator phiên bản, **6 giờ** | [#14 — J3-RULES](https://github.com/doductuan20235859/project_web/issues/14): kịch bản/oracle cân bằng 30 ngày và tài liệu luật, **6 giờ** |
| **DXKhai20235749** — engine | [#3](https://github.com/doductuan20235859/project_web/issues/3): executor ngày với fixture rules, **8 giờ** | [#10 — J2-ENGINE](https://github.com/doductuan20235859/project_web/issues/10): nhiều ngày, kinh tế/sức khỏe cuối ngày, **7 giờ** | [#15 — J3-ENGINE](https://github.com/doductuan20235859/project_web/issues/15): seed, ledger, ngưỡng và biên ngày 30, **6 giờ** |
| **dhminh28** — UI | [#5](https://github.com/doductuan20235859/project_web/issues/5): ActivityPanel/DayReview qua props, **6 giờ** | [#11 — J2-UI](https://github.com/doductuan20235859/project_web/issues/11): nhật ký/quan hệ và review suy ra từ state, **6 giờ** | [#16 — J3-UI](https://github.com/doductuan20235859/project_web/issues/16): mobile, bàn phím, lỗi và presentation qua DayActions, **6 giờ** |
| **kjfvnju** — session/save | [#4](https://github.com/doductuan20235859/project_web/issues/4): dispatch với executor được inject, **7 giờ** | [#12 — J2-SAVE](https://github.com/doductuan20235859/project_web/issues/12): API xuất/nhập, backup và phục hồi an toàn, **6 giờ** | [#17 — J3-SAVE](https://github.com/doductuan20235859/project_web/issues/17): PWA và cập nhật app tại điểm an toàn, **7 giờ** |
| **thanhpro82** — QA/tools | [#6](https://github.com/doductuan20235859/project_web/issues/6): CI và baseline test hiện có, **5 giờ** | [#13 — J2-QA](https://github.com/doductuan20235859/project_web/issues/13): headless scenario harness nhận executor, **6 giờ** | [#18 — J3-QA](https://github.com/doductuan20235859/project_web/issues/18): bộ fault injection, acceptance runner và báo cáo CI, **6 giờ** |

Ước lượng mỗi người lần lượt là 18, 21, 18, 20 và 17 giờ làm thực, chưa cộng review. KJFVNJU phụ trách thêm issue tích hợp ngày 1 khoảng 4 giờ; THANHPRO82 phụ trách một gate nghiệm thu thật cuối đợt khoảng 4 giờ. Như vậy cả ba Job của QA vẫn có thể bàn giao độc lập, không phải giữ mở vì chờ mọi phần khác. Nếu phần PWA phát sinh vượt dự kiến, tách PR cache và PR cập nhật an toàn trong cùng issue thay vì giảm kiểm chứng dữ liệu save.

Mỗi Job là một kết quả có thể review. Nếu vượt khoảng 8 giờ, tách thành PR nhỏ cùng issue với tiêu chí từng phần; không nhận thêm scope ngoài bảng mà vẫn giữ nguyên hạn.

## 4. Năm issue Job 1 được nghiệm thu độc lập

### #2 — doductuan: dữ liệu rules ngày và validator

**Phạm vi:** `src/content/gameplay/**`, bộ kiểm tra rules và test dữ liệu. Dữ liệu tuân `DayRules`/`GameplayContent`; không sửa engine hoặc UI.

- [ ] Có bộ hoạt động nghỉ/học/làm thêm theo contract, lịch ca và payday, tiền/cost/hiệu ứng được đặt tên.
- [ ] Validator phát hiện ID trùng, chi phí âm, số không hữu hạn, lịch không hợp lệ và cấu hình không có đường nghỉ an toàn.
- [ ] Phân biệt cash với lương chờ trả; mô tả thứ tự rủi ro → settlement → phí → phục hồi theo quyết định của nhóm.
- [ ] Bảng luật và test dữ liệu qua mà không import executor, session hoặc component của người khác.
- [ ] PR chỉ thay dữ liệu/validator thuộc phạm vi; có ghi rõ các số là giả định cân bằng game.

**Đầu vào:** common base. **Không chờ #3/#4/#5.** Reviewer chính: **DXKhai**.

### #3 — DXKhai: thực thi một ngày bằng rules fixture

**Phạm vi:** `src/engine/execute-command.ts`, `day-cycle.ts`, module engine cần thiết và test engine riêng. Hàm factory đóng gói rules/content rồi trả `CommandExecutor`.

- [ ] Với `makePlanningDay1` và rules fixture, `EXECUTE_DAY` chuyển sang `review`; `ACK_DAY` chuyển đúng sang planning ngày 2.
- [ ] Revision tăng một lần cho command hợp lệ; sai phase/revision/hoạt động không sửa input, RNG hoặc ledger.
- [ ] Tổng tài nguyên ca làm và hoạt động được kiểm tra trên một candidate; không dùng clamp để che thiếu chi phí.
- [ ] Có `ActivityOptionsProvider` dùng cùng luật với executor, giải thích lựa chọn bị khóa.
- [ ] Test chỉ dùng common fixture; chưa cần dữ liệu sản xuất trong #2 hoặc session của #4.
- [ ] Oracle so sánh chỉ số, tài chính và phase; không ép engine thật trả thông điệp hoặc ID mang nhãn mẫu của `fixtureExecutor`.

**Đầu vào:** common base. **Không chờ #2/#4/#5.** Reviewer chính: **kjfvnju**.

### #5 — dhminh: component hoạt động và kết quả qua props

**Phạm vi:** `src/features/activities/**`, component review, UI dùng chung cần thiết, selectors trình bày và slot workbench.

- [ ] ActivityPanel nhận `ActivityOption[]`, trạng thái bận và callback; không import `GameSession` singleton hoặc engine.
- [ ] DayReview nhận snapshot/view model cùng callback acknowledge; hiển thị `turn.summary.message` mà không đổi schema save.
- [ ] Workbench demo planning, review, thiếu tiền, kiệt sức và đang lưu bằng dữ liệu chung.
- [ ] Lựa chọn khóa có lý do; đang lưu không gửi tiếp; kết quả lỗi hiển thị bằng text.
- [ ] Có ảnh hoặc bước demo workbench; không cần engine thật hay persistence thật để PR được nghiệm thu.

**Đầu vào:** common base. **Không chờ #2/#3/#4.** Reviewer chính: **thanhpro82**.

### #4 — kjfvnju: session dispatch với executor được inject

**Phạm vi:** `src/application/game-session.ts`, port liên quan, adapter lưu cần thiết và test persistence/session. Nhận `CommandExecutor`/`ActivityOptionsProvider` từ bên ngoài; không import engine ngày cụ thể trong session.

- [ ] Có dispatch tuần tự hóa command; không tạo hai candidate đồng thời từ một revision.
- [ ] Unit test dùng `fixtureExecutor` hoặc fake executor test riêng; current state chỉ được publish sau commit thành công.
- [ ] Lỗi executor/commit giữ nguyên snapshot đã lưu; có thể phản hồi qua `DayActions` mà không mất lỗi.
- [ ] Double-click/command cũ không cộng hiệu ứng hai lần; CAS vẫn kiểm tra runId và revision.
- [ ] Reload fixture review/pending event giữ state/RNG; schema strict v1 không bị nới lỏng để test qua.
- [ ] Production bootstrap chưa gắn `fixtureExecutor`; việc ghép engine thật thuộc issue tích hợp riêng.

**Đầu vào:** common base và repository hiện có. **Không chờ #2/#3/#5.** Reviewer chính: **doductuan**.

### #6 — thanhpro82: CI và baseline chạy được ngay

**Phạm vi:** `.github/workflows/**`, cấu hình test/script, `tests/e2e/**` và công cụ báo cáo kiểm tra. Không viết lại test nghiệp vụ của bốn module.

- [ ] CI trên PR về `develop` chạy npm ci, typecheck, lint, content validation, unit/integration test và build.
- [ ] Có job hoặc hướng dẫn chạy baseline Playwright tạo nhân vật/reload hiện có và kiểm tra workbench.
- [ ] Báo cáo nêu rõ bài nào dùng fixture, bài nào chạy scaffold thật; không nhận nhầm demo ngày thật đã hoàn thành.
- [ ] Các kiểm tra hiện có xanh trước khi engine/UI/session mới được merge; không để test fail hoặc skip toàn bộ vì chờ bốn người.
- [ ] Lỗi kiểm tra có command chạy lại và artifact/log phù hợp.

**Đầu vào:** common base và scaffold hiện có. **Không chờ #2/#3/#4/#5.** Reviewer chính: **dhminh**.

## 5. Issue tích hợp ngày 1: một đầu mối, một demo thật

**Issue:** [#19 — J-INTEGRATION](https://github.com/doductuan20235859/project_web/issues/19). **Owner:** kjfvnju. **Reviewer:** DXKhai; thanhpro82 xác nhận kịch bản. **Ước lượng:** 4 giờ.

Issue này có phụ thuộc thật vào #2, #3, #4 và #5 đã merge. Dùng kiểm tra CI của #6 khi sẵn sàng; chưa có CI không miễn chạy các lệnh kiểm tra liên quan.

- Ghép dữ liệu thật → executor thật → session thật → IndexedDB → component qua props.
- KJFVNJU sửa `src/app/bootstrap.ts` và integration container; DHMINH chỉ sửa `App.tsx`/component nếu props cần khớp contract đã thống nhất.
- Demo: tạo nhân vật → chọn hoạt động → review ngày 1 → reload vẫn review → acknowledge sang planning ngày 2 đúng một lần.
- Chạy kiểm tra lỗi ghi và thao tác lặp, ghi bằng chứng; không dùng fixture executor trong đường đi này.

Năm issue Job 1 vẫn được đóng sau PR riêng merge và đạt nghiệm thu module; không giữ tất cả mở tới demo. Khi kjfvnju tích hợp, doductuan/DXKhai/dhminh/thanhpro82 có thể bắt đầu Job 2. Nếu phát hiện bug ngoài phạm vi, tạo issue có bước tái hiện và owner cụ thể, thay vì sửa chéo nhiều thư mục trong PR tích hợp.

## 6. Job 2: mỗi người tiếp tục mà không đợi nhóm ghép xong

| Mã | Owner, phạm vi | Đầu vào thật sự cần | Nghiệm thu module |
|---|---|---|---|
| [#9 — J2-RULES](https://github.com/doductuan20235859/project_web/issues/9) | doductuan; cấu hình ca/nghỉ, payday/chi phí và phiên bản | #2 | Có rules cho ngày làm/nghỉ và mẫu cash/energy sát ngưỡng; validator phát hiện dữ liệu/phiên bản sai, ngày trả lương và phí được mô tả rõ; luôn có phương án nghỉ hợp lệ; không yêu cầu engine đã nối UI |
| [#10 — J2-ENGINE](https://github.com/doductuan20235859/project_web/issues/10) | DXKhai; economy/wellbeing qua nhiều ngày | #3 | Kiểm chứng energy 19/20 trước ngủ, XP trên 100, payday/chi phí chỉ xử lý một lần, phần thiếu giữ lại; chuỗi ACK/execute nhiều ngày dùng rules fixture riêng nếu rules thật đang review |
| [#11 — J2-UI](https://github.com/doductuan20235859/project_web/issues/11) | dhminh; nhật ký/quan hệ và review | #5 | Hiển thị ledger/journal và điểm riêng NPC từ snapshot fixture; phân biệt cash/lương chờ trả; review suy ra dữ liệu để hiển thị, không thêm field vào summary/save hoặc tự tính luật |
| [#12 — J2-SAVE](https://github.com/doductuan20235859/project_web/issues/12) | kjfvnju; use case xuất/nhập/backup | #4 | Dùng helper JSON sẵn có, validate trước khi thay current, giữ bản cũ khi lỗi/future version, phục hồi có CAS; lỗi commit không publish và retry không nhân hiệu ứng; dùng fake executor để kiểm chứng, trả dữ liệu qua port cho UI |
| [#13 — J2-QA](https://github.com/doductuan20235859/project_web/issues/13) | thanhpro82; `scripts/scenarios/**` và headless harness | #6, common executor port | Runner nhận executor/state/command sequence; xuất seed, bước lỗi, phase/revision và kết quả; tự kiểm tra harness bằng fixture, chưa kết luận cân bằng engine thật |

Không ghi `Blocked by J-INTEGRATION` cho cả năm Job 2. Tích hợp thật có thể cung cấp thêm lỗi để sửa, nhưng không phải đầu vào bắt buộc của những sản phẩm trong bảng.

## 7. Job 3: hoàn thiện từng phần và tách gate nghiệm thu thật

| Mã | Owner, phạm vi | Đầu vào | Nghiệm thu |
|---|---|---|---|
| [#14 — J3-RULES](https://github.com/doductuan20235859/project_web/issues/14) | doductuan; kịch bản/oracle 30 ngày và tài liệu luật | [#9 — J2-RULES](https://github.com/doductuan20235859/project_web/issues/9) | Dữ liệu tới payday, giả định thu/chi và policy mẫu qua validator; có bảng kết quả/ngưỡng kỳ vọng và các trạng thái cần kiểm tra; chỉ là dữ liệu/oracle, chưa kết luận đã cân bằng runtime hoặc hoàn thành truyện 30 ngày |
| [#15 — J3-ENGINE](https://github.com/doductuan20235859/project_web/issues/15) | DXKhai; ngưỡng, seed, ledger và biên chương | [#10 — J2-ENGINE](https://github.com/doductuan20235859/project_web/issues/10) | Cùng seed/command cho cùng state; không chạy lại settlement sau ACK/reload; fixture ngày 30 trả lương trước tổng kết, ledger đối chiếu được, dừng đúng chương. Chỉ thêm đánh giá mục tiêu nếu contract đã có, không tự thêm story catalog; test không phụ thuộc UI/IndexedDB |
| [#16 — J3-UI](https://github.com/doductuan20235859/project_web/issues/16) | dhminh; mobile/a11y/lỗi và presentation | [#11 — J2-UI](https://github.com/doductuan20235859/project_web/issues/11) | Các phase/view model fixture dùng được ở 360px, bàn phím và focus đúng; lỗi không xóa đầu vào, đang lưu không gửi lặp; UI nhận `DayActions` qua props và hiển thị sau reload theo snapshot; không import session singleton |
| [#17 — J3-SAVE](https://github.com/doductuan20235859/project_web/issues/17) | kjfvnju; PWA và cập nhật an toàn | [#12 — J2-SAVE](https://github.com/doductuan20235859/project_web/issues/12) | Build production tải lần đầu rồi mở lại scaffold không mạng; cache app/assets tách database save; thông báo update chỉ reload khi session đã commit/xử lý xong; lifecycle có điểm inject kiểm tra an toàn, không cần engine thật để kiểm thử module và không cache workbench như ứng dụng chơi |
| [#18 — J3-QA](https://github.com/doductuan20235859/project_web/issues/18) | thanhpro82; fault injection, acceptance runner và báo cáo CI | [#13 — J2-QA](https://github.com/doductuan20235859/project_web/issues/13) | Có wrapper repository lỗi/CAS, bộ scenario và reporter kiểm tra được bằng adapter thử nghiệm; CI baseline thật vẫn xanh; job này không chờ PWA/UI/engine hoàn chỉnh và không nhận là đã nghiệm thu sản phẩm |

Tạo riêng **[#20 — J-FINAL](https://github.com/doductuan20235859/project_web/issues/20) — nghiệm thu trên module thật**, owner thanhpro82, reviewer doductuan, ước lượng 4 giờ. Gate này phụ thuộc [#19 — J-INTEGRATION](https://github.com/doductuan20235859/project_web/issues/19) và các Job 3 đã merge. Nó chạy luồng ngày thật, reload, thao tác lặp, payday/boundary, save conflict, mobile và offline; đối chiếu dữ liệu thật, ghi seed/log/bằng chứng. Không có test chỉ chạy fixture nào thay thế được gate này.

Như vậy 15 issue module có thể merge theo contract riêng. Chỉ hai issue [#19 — J-INTEGRATION](https://github.com/doductuan20235859/project_web/issues/19) và [#20 — J-FINAL](https://github.com/doductuan20235859/project_web/issues/20) có phụ thuộc chéo bắt buộc. Job 2/3 nối tiếp việc của chính owner; không biến chúng thành một hàng chờ năm người.

PWA được nghiệm thu module ở [#17 — J3-SAVE](https://github.com/doductuan20235859/project_web/issues/17), rồi QA xác nhận offline trong đường đi tích hợp thật khi sẵn sàng. Nếu chức năng chưa qua kiểm chứng thì báo rõ; không gắn nhãn toàn bộ cốt truyện 30 ngày đã đạt. Gặp pending event trong fixture chỉ chứng minh khả năng giữ/hiển thị snapshot đó, không chứng minh event engine đã hoạt động.

## 8. Ownership để tránh xung đột

| Owner | Đường dẫn chính | Giao điểm cần giữ rõ |
|---|---|---|
| doductuan | `src/content/gameplay/**`, validator dữ liệu và test content | Không sửa `engine/**`; đổi contract chung qua PR riêng |
| DXKhai | `src/engine/**`, `tests/engine/**` | Không sửa balance thật của doductuan; test có fixture cục bộ |
| dhminh | `src/features/**`, `src/shared/ui/**`, `src/styles/**`, `src/workbench/**`, `src/app/App.tsx`, selectors trình bày | Component nhận state/view model/`DayActions` qua props; không tự gọi singleton hoặc storage |
| kjfvnju | `src/application/**` trừ selectors trình bày, `src/infrastructure/**`, `tests/persistence/**`, `src/app/bootstrap.ts`, `src/app/integration/**` | Integration container đọc store/session và truyền props cho App; không nhận quyền sửa toàn bộ App/features |
| thanhpro82 | `.github/workflows/**`, `tests/e2e/**`, scenario harness, scripts kiểm thử, cấu hình công cụ | Là đầu mối `package.json`/lockfile khi cần dependency; không sửa luật chỉ để test xanh |

`App.tsx` là composition bằng props của dhminh; `src/app/integration/**` là phần nối session/store của kjfvnju. Hai người thống nhất props qua port trước, không cùng sửa một container. Việc chuyển App hiện tại sang điểm nối đó thuộc [#19 — J-INTEGRATION](https://github.com/doductuan20235859/project_web/issues/19), không thuộc common base additive.

`src/testing/day-fixtures.ts` là dữ liệu chung đã chốt. Fixture riêng đặt trong test của owner; không dùng sửa fixture chung để che lỗi thực thi. Test của tính năng do owner tính năng viết; QA chịu CI/harness và kiểm tra xuyên lớp, không gánh toàn bộ test nhóm.

Reviewer chính theo vòng: doductuan → DXKhai → kjfvnju → doductuan; dhminh → thanhpro82 → dhminh. Mỗi PR có ít nhất một reviewer khác tác giả, có thể thêm người hiểu phần bị tác động. Review là công việc ưu tiên để giảm thời gian chờ merge.

## 9. Common-base PR và nhánh làm việc

1. Common base được đưa lên một nhánh tính năng riêng và mở PR về `develop`, có danh sách contract/fixture, cách mở workbench và kết quả kiểm tra.
2. Tác giả yêu cầu ít nhất một reviewer khác mình. Không tự approve, tự merge hoặc push thẳng `develop` để mở khóa nhóm.
3. Trong lúc chờ, thành viên có thể tạo nhánh làm việc tạm trên commit common base và mở **Draft PR về `develop`**, ghi rõ PR common base cần được merge trước. Chưa đánh dấu Ready/merge khi common base chưa được duyệt.
4. Sau common base merge, cập nhật/merge `origin/develop` vào nhánh tính năng, kiểm tra diff chỉ còn phần của issue mình và chạy lại kiểm tra liên quan. Các issue bắt đầu sau đó tách nhánh từ `develop` như workflow chuẩn.
5. Tất cả PR hoàn thiện vẫn có base `develop`, dùng `Refs #<issue-thật>`, có reviewer khác tác giả và đạt kiểm tra trước merge. Không merge Draft PR vào nhánh common base để thay cho review vào develop.
6. Sau PR merge và nghiệm thu đúng scope, đóng issue thủ công. `develop → main` là PR phát hành riêng; không yêu cầu năm Job 1 phải chờ phát hành mới được Done.

Quy tắc đầy đủ ở [WORKFLOW.md](WORKFLOW.md). Cập nhật tiến độ ngay trên các issue đã liên kết trong bảng; không đổi dependency module thành dependency toàn bộ demo nếu không có lý do kỹ thuật cụ thể.

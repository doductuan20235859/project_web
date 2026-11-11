# Chạy kịch bản không cần giao diện

Chạy từ `game/` với Node.js 24 và dependency đã cài bằng `npm ci`.

```powershell
npx tsx scripts/scenarios/run-fixture.ts
npm test -- tests/scenarios
```

Lệnh đầu chạy baseline ngày 1 bằng provider `fixture` của common base và in báo cáo JSON. Nó trả exit code `1` nếu sai kỳ vọng. Vitest chạy thêm test với các provider `test` cố tình trả sai snapshot, sai mã lỗi, sửa input hoặc ném exception.

`runScenario(provider, scenario)` nhận một `CommandExecutor`, snapshot ban đầu và danh sách command có kỳ vọng. Mỗi bước khai báo snapshot kế tiếp hoặc mã từ chối dự kiến. Có thể truyền một executor khác và gắn loại `production` khi dùng engine thật. Kỳ vọng cần lấy từ dữ liệu đã xác định trước thay vì từ executor đang được kiểm tra.

Báo cáo ghi loại và tên provider, seed, chỉ số command tính từ `0`, ngày/phase/revision trước và sau bước, cùng sai khác nếu có. Runner dừng ở bước sai đầu tiên để giữ nguyên ngữ cảnh lỗi. Lệnh bị từ chối đúng kỳ vọng giữ nguyên snapshot và cho phép tiếp tục kịch bản. Kết quả `fixture` và `test` kiểm chứng harness cùng contract mẫu. Nghiệm thu gameplay trên module thật thuộc [issue #20](https://github.com/doductuan20235859/project_web/issues/20).

## Acceptance và giả lập lỗi lưu

```powershell
npx tsx scripts/scenarios/run-acceptance.ts
npm test -- tests/scenarios
```

CLI trả exit code `1` nếu có ca sai. Báo cáo mặc định nằm ở `test-results/acceptance/report.json`, gồm metadata provider, seed/command/phase/revision, snapshot đầu vào, snapshot kỳ vọng và lỗi có diff để tái hiện. Job **Acceptance toolkit (fixture)** trên GitHub Actions chạy riêng và xuất artifact `acceptance-fixture` kể cả khi một ca thất bại. Các baseline Playwright vẫn chạy ở hai job riêng.

Provider mặc định dùng fixture executor và `MemorySaveRepository` hiện có. Năm ca lưu kiểm tra commit/backup, lỗi ghi rồi retry, conflict giả lập, CAS thật với writer cũ, và commit chỉ hiện ra sau khi gỡ giữ. Đây là kiểm tra harness, repository và contract fixture. Để kiểm tra các ca riêng bằng Vitest, chạy `npm test -- tests/scenarios/acceptance.test.ts` hoặc `npm test -- tests/scenarios/fault-repository.test.ts`.

`withCommitFaults(repository, faults)` bọc một `SaveRepository`. Mỗi phần tử tương ứng một lần gọi commit. `error` ném lỗi ghi, `conflict` ném `SaveConflictError`, `delay` chờ callback `wait`. Sau khi hết danh sách, commit gọi repository gốc. `createCommitGate()` cung cấp `entered` để biết commit đã bị giữ và `release()` để tiếp tục. Snapshot và revision kỳ vọng được chụp trước khi chờ. CAS của repository gốc vẫn được kiểm tra khi commit thực sự chạy.

## Dùng provider thật ở gate cuối

Tạo module TypeScript export default một `AcceptanceProvider` từ `acceptance.ts`. Cung cấp tên, loại `production`, `commands` với executor thật, factory `scenario`, `initialSave`, `candidateSave` và `createRepository`. Mỗi lần gọi factory repository phải trả một kho trống độc lập. Ví dụ adapter IndexedDB cần tên database riêng và tự thu dọn tài nguyên sau bộ chạy.

Scenario phải chứa kết quả đã được duyệt theo rules/content thật. Hai save dùng cùng run ID và schema, candidate tăng revision đúng một lần. Adapter chịu trách nhiệm ghép các module thật. Khi báo cáo dùng loại `production`, `commands.kind` cũng phải phản ánh executor thực tế. Đặt đường dẫn provider và báo cáo theo thư mục `game/` đang chạy.

```powershell
npx tsx scripts/scenarios/run-acceptance.ts --provider ./scripts/scenarios/providers/production.ts --output test-results/acceptance/production.json
```

Đường dẫn `production.ts` trên là ví dụ cho adapter sẽ bổ sung khi gate #20 sẵn sàng. Kiểm tra session publish sau commit, luồng UI, mobile và offline vẫn cần chạy qua các entry point thật ở gate đó.

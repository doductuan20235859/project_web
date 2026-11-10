# Chạy kịch bản không cần giao diện

Chạy từ `game/` với Node.js 24 và dependency đã cài bằng `npm ci`.

```powershell
npx tsx scripts/scenarios/run-fixture.ts
npm test -- tests/scenarios
```

Lệnh đầu chạy baseline ngày 1 bằng provider `fixture` của common base và in báo cáo JSON. Nó trả exit code `1` nếu sai kỳ vọng. Vitest chạy thêm test với các provider `test` cố tình trả sai snapshot, sai mã lỗi, sửa input hoặc ném exception.

`runScenario(provider, scenario)` nhận một `CommandExecutor`, snapshot ban đầu và danh sách command có kỳ vọng. Mỗi bước khai báo snapshot kế tiếp hoặc mã từ chối dự kiến. Có thể truyền một executor khác và gắn loại `production` khi dùng engine thật. Kỳ vọng cần lấy từ dữ liệu đã xác định trước thay vì từ executor đang được kiểm tra.

Báo cáo ghi loại và tên provider, seed, chỉ số command tính từ `0`, ngày/phase/revision trước và sau bước, cùng sai khác nếu có. Runner dừng ở bước sai đầu tiên để giữ nguyên ngữ cảnh lỗi. Lệnh bị từ chối đúng kỳ vọng giữ nguyên snapshot và cho phép tiếp tục kịch bản. Kết quả `fixture` và `test` kiểm chứng harness cùng contract mẫu. Nghiệm thu gameplay trên module thật thuộc [issue #20](https://github.com/doductuan20235859/project_web/issues/20).

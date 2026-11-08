export class SaveValidationError extends Error {
  constructor(message = 'Dữ liệu lưu không hợp lệ. Bản lưu hiện tại được giữ nguyên.') {
    super(message);
    this.name = 'SaveValidationError';
  }
}

export class UnsupportedSaveVersionError extends SaveValidationError {
  constructor() {
    super('Phiên bản bản lưu chưa được hỗ trợ. Hãy giữ lại dữ liệu và mở bằng phiên bản ứng dụng tương thích.');
    this.name = 'UnsupportedSaveVersionError';
  }
}

export class SaveConflictError extends Error {
  constructor() {
    super('Bản lưu đã thay đổi ở tab khác hoặc đã có lượt chơi. Hãy tải lại trước khi tiếp tục.');
    this.name = 'SaveConflictError';
  }
}

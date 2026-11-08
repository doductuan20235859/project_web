export type ValidationErrorCode =
  | 'INVALID_CHARACTER'
  | 'INVALID_SEED'
  | 'INVALID_RUN_ID'
  | 'INVALID_CONTENT'
  | 'INVALID_STATE';

export class GameValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GameValidationError';
  }
}

export interface GameRuleError {
  code: 'INVALID_PHASE' | 'INVALID_CHOICE' | 'INSUFFICIENT_RESOURCES' | 'STALE_COMMAND';
  message: string;
}

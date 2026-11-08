import { z } from 'zod';
import type { SaveEnvelope, SaveExpectation } from '../../application/ports/save-repository';
import { assertGameState } from '../../domain/invariants';
import type { GameState } from '../../domain/model/game-state';
import { AVATAR_IDS, BACKGROUND_IDS, GOAL_IDS, NPC_IDS } from '../../domain/model/ids';
import { SaveValidationError, UnsupportedSaveVersionError } from './errors';

const integer = z.number().int().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER);
const nonnegative = integer.min(0);
const day = integer.min(1);
const stat = integer.min(0).max(100);
const identifier = z.string().min(1);
const uint32 = integer.min(0).max(0xffff_ffff);

const eventInstanceSchema = z.object({
  id: identifier,
  eventId: identifier,
  contentVersion: identifier,
  day,
  parameters: z.record(z.string(), z.union([z.string(), z.number().finite(), z.boolean()])),
  snapshot: z.object({
    title: z.string(),
    description: z.string(),
    choices: z.array(z.object({ id: identifier, label: z.string() }).strict()),
  }).strict(),
}).strict();

export const gameStateSchema: z.ZodType<GameState> = z.object({
  meta: z.object({
    runId: identifier,
    revision: nonnegative,
    lastCommandId: identifier.nullable(),
    rulesVersion: identifier,
    contentVersion: identifier,
  }).strict(),
  clock: z.object({
    day: day.max(30),
    phase: z.enum(['planning', 'event', 'review', 'finished']),
  }).strict(),
  character: z.object({
    name: z.string().min(1),
    avatarId: z.enum(AVATAR_IDS),
    backgroundId: z.enum(BACKGROUND_IDS),
    goalId: z.enum(GOAL_IDS),
    energy: stat,
    health: stat,
    stress: stat,
    japaneseXp: nonnegative,
  }).strict(),
  economy: z.object({
    cash: nonnegative,
    unpaidWages: nonnegative,
    unpaidEssentialCosts: nonnegative,
    paidPayrollPeriods: z.array(identifier),
    ledger: z.array(z.object({
      id: identifier,
      day,
      kind: z.enum(['wage-accrual', 'payroll', 'expense', 'payment']),
      amount: nonnegative,
      reason: z.string(),
    }).strict()),
  }).strict(),
  relationships: z.record(z.enum(NPC_IDS), stat),
  work: z.object({ trust: stat, overtimeDays: z.array(day) }).strict(),
  story: z.object({
    flags: z.record(z.string(), z.boolean()),
    history: z.array(z.object({
      instanceId: identifier,
      eventId: identifier,
      day,
      choiceId: identifier,
    }).strict()),
    promises: z.array(z.object({
      id: identifier,
      npcId: z.enum(NPC_IDS),
      dueDay: day,
      status: z.enum(['pending', 'fulfilled', 'broken']),
    }).strict()),
    scheduledConsequences: z.array(z.object({
      id: identifier,
      eventId: identifier,
      dueDay: day,
      status: z.enum(['pending', 'resolved']),
    }).strict()),
    cooldowns: z.record(z.string(), nonnegative),
  }).strict(),
  turn: z.object({
    activityId: identifier.nullable(),
    eventQueue: z.array(eventInstanceSchema),
    summary: z.object({ day, message: z.string() }).strict().nullable(),
  }).strict(),
  counters: z.object({
    daysWithoutLivingMoney: nonnegative,
    consecutiveExhaustedDays: nonnegative,
  }).strict(),
  random: z.object({ seed: uint32, state: uint32, algorithm: z.literal('mulberry32-v1') }).strict(),
  journal: z.array(z.object({
    id: identifier,
    day,
    kind: z.enum(['milestone', 'decision', 'system']),
    message: z.string(),
  }).strict()),
}).strict();

const envelopeSchema: z.ZodType<SaveEnvelope> = z.object({
  schemaVersion: z.literal(1),
  appVersion: identifier,
  savedAt: z.string().datetime({ offset: true }),
  state: gameStateSchema,
}).strict();

export function parseSaveEnvelope(value: unknown): SaveEnvelope {
  if (typeof value === 'object' && value !== null && 'schemaVersion' in value && value.schemaVersion !== 1) {
    throw new UnsupportedSaveVersionError();
  }
  const result = envelopeSchema.safeParse(value);
  if (!result.success) {
    throw new SaveValidationError();
  }
  try {
    assertGameState(result.data.state);
  } catch {
    throw new SaveValidationError();
  }
  return result.data;
}

export function validateCommitCandidate(candidate: SaveEnvelope, expected: SaveExpectation | null): SaveEnvelope {
  const validated = parseSaveEnvelope(candidate);
  if (expected !== null && (
    validated.state.meta.runId !== expected.runId ||
    validated.state.meta.revision !== expected.revision + 1
  )) {
    throw new SaveValidationError('Bản cập nhật phải giữ nguyên lượt chơi và tăng revision đúng một lần.');
  }
  return validated;
}

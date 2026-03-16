import { z } from 'zod'

export type VfsErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_NAME'
  | 'ALREADY_EXISTS'
  | 'INVALID_OPERATION'
  | 'NOT_A_DIRECTORY'
  | 'IS_DIRECTORY'

export class VfsError extends Error {
  readonly code: VfsErrorCode

  constructor(code: VfsErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

const nodeNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[^\\/:*?"<>|]+$/, 'Name contains unsupported characters')

export function validateNodeName(name: string): string {
  const parsed = nodeNameSchema.safeParse(name)
  if (!parsed.success) {
    throw new VfsError('INVALID_NAME', parsed.error.issues[0]?.message ?? 'Invalid file name')
  }

  return parsed.data
}

export function assert(condition: boolean, code: VfsErrorCode, message: string): asserts condition {
  if (!condition) {
    throw new VfsError(code, message)
  }
}

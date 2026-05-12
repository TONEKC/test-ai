export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export interface ApiError {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    details?: unknown
  }
}

export class ApiError extends Error {
  constructor(message: string, public status = 400, public code = "REQUEST_FAILED") { super(message); }
}

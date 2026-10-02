export class AppError extends Error {
  constructor(code, message, hint = "", status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.hint = hint;
    this.status = status;
  }
}

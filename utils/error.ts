class CustomError extends Error {
  errorType: string;
  statusCode: number;
  constructor(errorType: string, message: string, statusCode: number) {
    super();
    this.errorType = errorType;
    this.message = message;
    this.statusCode = statusCode;
  }
}


// module.exports = CustomError;
export default CustomError;
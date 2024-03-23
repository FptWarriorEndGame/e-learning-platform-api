class CustomErrorMessage extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// module.exports = CustomError;
export default CustomErrorMessage;
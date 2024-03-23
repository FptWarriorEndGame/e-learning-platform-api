
const UNSPLASH_API_KEY = "uq_ad2eH1y4LjziHL50dLDv8h1esiKtEUNejDcwEOgw";
const YOUTUBE_API_KEY = "AIzaSyBhd4f7KxGoXeR5HHXUZeYm5e5JHmS35Ws";
const OPEN_AI_KEY = "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";
// Mongodb URI remote
  // Mongodb URI remote
export const MONGODB_URI = process.env.MONGODB_URI;
export const PWD_SALT_ROUNDS = 12;
export const ERROR_NOT_FOUND_DATA = "Error! Cannot found data";
export const ERROR_GET_DATA = "Failed to fetch data";
export const ERROR_GET_DATA_HISTORIES = "Failed to fetch data histories";
export const ERROR_GET_DATA_DETAIL = "Failed to fetch data detail";
export const ERROR_CREATE_DATA = "Failed to create data";
export const ERROR_UPDATE_DATA = "Failed to update data";
export const ERROR_ACCEPT_DATA = "Failed to accept data";
export const ERROR_UPDATE_ACTIVE_DATA = "Failed to update active status";
export const ERROR_CODE_TAKEN = "Code has already used!";
export const ERROR_NAME_TAKEN = "Name has already used!";
export const ERROR_USERNAME_DUPLICATE = "Username has already used!";
export const ERROR_YOU_DO_NOT_HAVE_PERMISSION = "You do not have permission!";
export const ERROR_INVALID_TYPE = "Data type is invalid!";

export const GET_SUCCESS = "Fetch data successfully.";
export const GET_HISOTIES_SUCCESS = "Fetch data histories successfully.";
export const GET_DETAIL_SUCCESS = "Fetch data detail successfully.";
export const CREATE_SUCCESS = "Create data successfully.";
export const UPDATE_SUCCESS = "Update data successfully.";
export const ACCEPT_SUCCESS = "Accept data successfully.";
export const UPDATE_ACTIVE_SUCCESS = "Update active status successfully.";
export const DELETE_SUCCESS = "Delete data successfully.";
export const IMPORT_SUCCESS = "Import data successfully.";
export const ACTION_SUCCESS = "Action successfully.";

export const DEFAULT_CONNECTION_NAME = "default";
export const DATA_SOURCE = "DATA_SOURCE";
export const TYPEORM_EX_CUSTOM_REPOSITORY = "TYPEORM_EX_CUSTOM_REPOSITORY";
export const millisecondInDay = 86400000;

export const COUPON_TYPES = {
  COUPON_TYPE_PERCENT: "65f4f3f70df4092dc3f30d92",
  COUPON_TYPE_FIXED_AMOUNT: "65f4f44d0df4092dc3f30d9d",
};

export { UNSPLASH_API_KEY, YOUTUBE_API_KEY, OPEN_AI_KEY };

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/`;

export const API = {
  SIGN_UP: `${BASE_URL}user/auth/signup`,
  LOGIN: `${BASE_URL}user/auth/login`,
  SIGN_OUT: `${BASE_URL}user/auth/logout`,
  OTP_REQUEST: `${BASE_URL}user/auth/forgot/password/`,
  PASSWORD_RESET: `${BASE_URL}user/auth/forgot/password`,
  PROFILE_READ: `${BASE_URL}user/profile/`,
  PROFILE_UPDATE: `${BASE_URL}user/profile/pic/update`,
  PROFILE_INFO_UPDATE: `${BASE_URL}user/profile/info/update`,
  FOLLOW: `${BASE_URL}user/profile/follow/`,
  SUGGEST_USER: `${BASE_URL}user/suggest`,
  SEARCH_USER: `${BASE_URL}user/search`,
  FOLLOWERS_LIST: `${BASE_URL}user/followers/`,
  FOLLOWING_LIST: `${BASE_URL}user/following/`,
  IMAGE_GALLERY: `${BASE_URL}user/profile/post/images/`,
};

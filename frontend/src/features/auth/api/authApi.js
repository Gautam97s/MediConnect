import axiosInstance from '../../../utils/axiosConfig';

const AUTH_MISSING_MESSAGE =
  'Auth API is not available (404). Add backend auth endpoints or update frontend auth routes.';

async function postWithFallback(payload, paths) {
  let lastError = null;

  for (const path of paths) {
    try {
      const response = await axiosInstance.post(path, payload);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      lastError = error;

      // Try next candidate only for 404.
      if (status === 404) {
        continue;
      }

      throw error;
    }
  }

  const fallbackError = new Error(AUTH_MISSING_MESSAGE);
  fallbackError.cause = lastError;
  throw fallbackError;
}

export const loginRequest = async (payload) => {
  return postWithFallback(payload, [
    '/auth/login',
    '/auth/signin',
    '/login',
    '/users/login'
  ]);
};

export const registerRequest = async (payload) => {
  return postWithFallback(payload, [
    '/auth/register',
    '/auth/signup',
    '/register',
    '/users/register'
  ]);
};

export const forgotPasswordRequest = async (payload) => {
  return postWithFallback(payload, [
    '/auth/forgot-password',
    '/auth/forgot',
    '/forgot-password'
  ]);
};

export const resetPasswordRequest = async (payload) => {
  return postWithFallback(payload, [
    '/auth/reset-password',
    '/auth/reset',
    '/reset-password'
  ]);
};

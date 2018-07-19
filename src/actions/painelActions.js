export const userLoggedIn = username => ({
  type: 'USER_LOGGED_IN',
  payload: {
    username
  }
});
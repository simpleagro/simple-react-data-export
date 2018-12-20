export const userLoggedIn = userData => ({
  type: "USER_LOGGED_IN",
  payload: {
    userData
  }
});

export const userSwitchedModule = seletorModulo => ({
  type: "USER_SWITCHED_MODULE",
  payload: {
    seletorModulo
  }
});

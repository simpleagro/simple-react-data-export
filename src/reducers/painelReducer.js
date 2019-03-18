const initialState = {
  userData: {
    user: {
      usertype: "",
      nome: ""
    },
    empresa: "",
    modulosDaEmpresa: [],
    rules: []
  },
  seletorModulo: {
    nome: "Trocar Módulo",
    slug: ""
  }
};

export const painelReducer = (state = initialState, action) => {
  switch (action.type) {
    case "USER_LOGGED_IN":
      return { ...state, userData: action.payload.userData };
    case "USER_SWITCHED_MODULE":
      return { ...state, seletorModulo: action.payload.seletorModulo };
    default:
      return state;
  }
};

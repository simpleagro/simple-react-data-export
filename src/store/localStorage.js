export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("simpleagro_painel");
    if (serializedState === null)
      return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
};

export const saveState = state => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('simpleagro_painel', serializedState)
  } catch (error) {
    //ignone error
    console.log(error);
  }
};
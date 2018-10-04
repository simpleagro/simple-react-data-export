import Cookies from "universal-cookie";

const cookies = new Cookies();

export const isAuthenticated = () => {
  const token = cookies.get("token");
  return token && token !== "" ? true : false;
};

export const logout = async (cb) => {
  await cookies.remove("token");
  if (cb)
    setTimeout(cb, 100);
};

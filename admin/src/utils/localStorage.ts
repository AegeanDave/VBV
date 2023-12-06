export const setStorage = (data: any) => {
  localStorage.setItem("sessionKey", data.sessionKey);
  localStorage.setItem("name", data?.name);
  localStorage.setItem("email", data.email);
  localStorage.setItem("phone", data?.loginPhoneNumber);
  localStorage.setItem(
    "setting",
    data?.setting && JSON.stringify(data?.setting)
  );
};

export const getStorage = () => {
  const user = {
    sessionKey: localStorage.getItem("sessionKey"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    phone: localStorage.getItem("phone"),
    setting:
      localStorage.getItem("setting") &&
      JSON.parse(localStorage.getItem("setting") as string),
  };
  return user;
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem("AccessToken");
  };
  
  export const setAccessToken = (token: string) => {
    localStorage.setItem("AccessToken", token);
  };
  
  export const clearAccessToken = () => {
    localStorage.removeItem("AccessToken");
  };
  
  export const removeAccessToken = () => {
    localStorage.removeItem("AccessToken"); 
  };
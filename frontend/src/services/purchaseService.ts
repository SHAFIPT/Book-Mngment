import axiosInstance from "./api";

export const createPurchase = async (payload: { bookId: string; quantity: number }) => {
    const res = await axiosInstance.post('/api/purchase', payload);
    return res.data;
  };
  
  export const getPurchaseHistory = async () => {
    const res = await axiosInstance.get('/api/purchase/history');
    return res.data;
};
  
export const getRevenueSummary = async () => {
  const res = await axiosInstance.get('/api/purchase/revenue-summary');
  return res.data;
};
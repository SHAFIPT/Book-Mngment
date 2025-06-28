import axiosInstance from "./api";

export const notifyAuthorOnPurchase = async (data: {
  bookId: string;
  userId: string;
  price: number;
  quantity: number;
}) => {
  const res = await axiosInstance.post("/api/notification/notify-author", data);
  return res.data;
};

export const sendMonthlyRevenueSummary = async () => {
  const res = await axiosInstance.post("/api/notification/monthly-summary");
  return res.data;
};

export const sendNewBookAnnouncement = async (bookId: string) => {
  const res = await axiosInstance.post("/api/notification/new-book-announcement", {
    bookId,
  });
  return res.data;
};

export const sendCustomBulkEmail = async (data: {
    subject: string;
    message: string;
    recipients: 'all' | 'active' | 'authors';
  }) => {
    const res = await axiosInstance.post("/api/notification/custom-bulk-email", data);
    return res.data;
  };
import { axiosInstance } from "./axiosIntance";

const AuthAPI = {
  sendOTP: async (email: string) => {
    try {
      const response = await axiosInstance.post("/auth/request-otp", {
        email: email,
      });
      return { success: true, response };
    } catch (error) {
      console.error("Error updating book:", error);
      return { success: false, error };
    }
  },
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        email: email,
        otp: otp,
      });
      return { success: true, response };
    } catch (error) {
      console.error("Error updating book:", error);
      return { success: false, error };
    }
  },
};

export default AuthAPI;

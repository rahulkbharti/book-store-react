import { axiosInstance } from "./axiosIntance";

type NewBook = {
  title: string;
  author: string;
  price: number;
  published_year: number;
};

type Params = {
  page: number;
  limit: number;
  author?: string;
};

const BookAPI = {
  getBooks: async (page = 1, limit = 3, author = "") => {
    try {
      const params: Params = {
        page: page,
        limit: limit,
      };
      if (author) {
        params.author = author;
      }
      const response = await axiosInstance.get("/books", {
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },
  createBook: async (bookData: NewBook) => {
    try {
      const response = await axiosInstance.post("/books", bookData);
      return response.data;
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  },
  updateBook: async (book_id: number, bookData: NewBook) => {
    try {
      const response = await axiosInstance.put(`/books/${book_id}`, bookData);
      return response.data;
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  },
  deleteBook: async (book_id: number) => {
    try {
      const response = await axiosInstance.delete(`/books/${book_id}`);
      return response.data;
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  },
};

export default BookAPI;

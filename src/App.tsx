import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
// import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import BookStoreLogin from "./pages/BookStoreLogin";
import BookStoreManagement from "./pages/BookStoreManagement";
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

const BookStoreApp: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <BrowserRouter basename="/book-store-react">
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <BookStoreLogin />
                  </PublicRoute>
                }
              ></Route>
              <Route path="/books" element={<BookStoreManagement />}></Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default BookStoreApp;

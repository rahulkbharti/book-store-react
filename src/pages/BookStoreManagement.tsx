import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Pagination,
  InputAdornment,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import BookAPI from "../axios/bookAPI";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { useNavigate } from "react-router-dom";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number | string;
  published_year: number | string;
};
type NewBook = {
  title: string;
  author: string;
  price: number;
  published_year: number;
};
type PaginationData = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

const BookStoreManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    page_size: 2, // Increased page size for better UX
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    price: "",
    published_year: new Date().getFullYear(),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );
  // console.log("IsAuthenticated", isAuthenticated);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getBooks = useCallback(
    async (pageNumber: number = 1, search: string = "") => {
      try {
        setLoading(true);
        const response = await BookAPI.getBooks(
          pageNumber,
          pagination.page_size,
          search
        );

        setBooks(response.data);
        setPagination(response.pagination);
        setError("");
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch books. Please try again.";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page_size]
  );

  useEffect(() => {
    getBooks(1);
  }, [getBooks]);

  const handleSearch = useCallback(() => {
    getBooks(1, searchTerm);
  }, [getBooks, searchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    getBooks(1);
  }, [getBooks]);

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      getBooks(value, searchTerm);
    },
    [getBooks, searchTerm]
  );

  const handleAddClick = () => {
    if (!isAuthenticated) {
      alert("You are not Authorized to Add Book, Please Login");
      return;
    }
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      price: "",
      published_year: new Date().getFullYear(),
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditClick = (book: Book) => {
    if (!isAuthenticated) {
      alert("You are not Authorized to Edit Book, Please Login");
      return;
    }
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      published_year: book.published_year,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (!isAuthenticated) {
      alert("You are not Authorized to Delete Book, Please Login");
      return;
    }
    setBookToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingBook(null);
    setFormErrors({});
  }, []);

  const handleDeleteConfirmClose = useCallback(() => {
    setDeleteConfirmOpen(false);
    setBookToDelete(null);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      errors.author = "Author is required";
    }

    if (!formData.price || parseFloat(formData.price as string) <= 0) {
      errors.price = "Price must be greater than 0";
    }

    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.published_year as string);
    if (!formData.published_year || year < 1000 || year > currentYear) {
      errors.published_year = `Published year must be between 1000 and ${currentYear}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      const processedData: NewBook = {
        ...formData,
        price: parseFloat(formData.price as string),
        published_year: parseInt(formData.published_year as string),
      };

      if (editingBook) {
        await BookAPI.updateBook(editingBook.id, processedData);
      } else {
        await BookAPI.createBook(processedData);
      }

      setDialogOpen(false);
      getBooks(pagination.page, searchTerm);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${editingBook ? "update" : "add"} book. Please try again.`;
      setError(errorMessage);
      console.error("Error saving book:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (bookToDelete === null) return;

    try {
      await BookAPI.deleteBook(bookToDelete);
      setDeleteConfirmOpen(false);

      // If we're on the last page and it's the last item, go to previous page
      if (books.length === 1 && pagination.page > 1) {
        getBooks(pagination.page - 1, searchTerm);
      } else {
        getBooks(pagination.page, searchTerm);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete book. Please try again.";
      setError(errorMessage);
      console.error("Error deleting book:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFormSubmit();
    }
  };
  const handleLogin = () => {
    navigate("/");
  };
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header and Add Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Book Management
        </Typography>
        <Stack direction="row" spacing={2}>
          {isAuthenticated ? (
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" color="info" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Search books by author name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: isMobile ? "100%" : 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Book
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ my: 4 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Books Grid */}
      {!loading && books.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No books found.{" "}
            {searchTerm
              ? "Try a different search."
              : "Add a book to get started."}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid size={{ xs: 12, sm: 4, md: 3 }} key={book.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {book.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom noWrap>
                      by {book.author}
                    </Typography>
                    <Box
                      sx={{
                        mb: 1,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2">Published:</Typography>
                      <Chip
                        label={book.published_year}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      $
                      {typeof book.price === "number"
                        ? book.price.toFixed(2)
                        : parseFloat(book.price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(book)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(book.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.total_pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Book Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              {editingBook ? "Edit Book" : "Add New Book"}
            </Typography>
            <IconButton onClick={handleDialogClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.author}
                  helperText={formErrors.author}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: 0.01,
                    step: 0.01,
                  }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Published Year"
                  name="published_year"
                  type="number"
                  value={formData.published_year}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.published_year}
                  helperText={formErrors.published_year}
                  inputProps={{
                    min: 1000,
                    max: new Date().getFullYear(),
                  }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit}>
            {editingBook ? "Update Book" : "Add Book"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this book? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookStoreManagement;

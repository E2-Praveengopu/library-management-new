import { Book } from "../models/index.js";

export const addBook = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  const {
    title,
    author,
    isbn,
    genre,
    totalCopies,
    availableCopies,
    coverImageUrl,
  } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required." });
  }
  if (!author) {
    return res
      .status(400)
      .json({ success: false, message: "Author is required." });
  }
  if (!isbn) {
    return res
      .status(400)
      .json({ success: false, message: "ISBN is required." });
  }
  if (!totalCopies) {
    return res
      .status(400)
      .json({ success: false, message: "Total copies is required." });
  }

  try {
    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A book with this ISBN already exists.",
        });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      genre: genre || null,
      totalCopies,
      availableCopies:
        availableCopies !== undefined ? availableCopies : totalCopies,
      coverImageUrl: coverImageUrl || null,
    });

    return res.status(201).json({
      success: true,
      message: "Book added successfully.",
      data: { book },
    });
  } catch (error) {
    console.error("Add book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: books } = await Book.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Books fetched successfully.",
      data: {
        books,
        pagination: {
          totalBooks: count,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all books error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Book fetched successfully.",
      data: { book },
    });
  } catch (error) {
    console.error("Get book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBook = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  const { id } = req.params;
  const {
    title,
    author,
    isbn,
    genre,
    totalCopies,
    availableCopies,
    coverImageUrl,
  } = req.body;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ where: { isbn } });
      if (existingBook) {
        return res
          .status(400)
          .json({
            success: false,
            message: "A book with this ISBN already exists.",
          });
      }
    }

    await book.update({
      title: title || book.title,
      author: author || book.author,
      isbn: isbn || book.isbn,
      genre: genre !== undefined ? genre : book.genre,
      totalCopies: totalCopies !== undefined ? totalCopies : book.totalCopies,
      availableCopies:
        availableCopies !== undefined ? availableCopies : book.availableCopies,
      coverImageUrl:
        coverImageUrl !== undefined ? coverImageUrl : book.coverImageUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: { book },
    });
  } catch (error) {
    console.error("Update book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  const { id } = req.params;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    await book.destroy();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Delete book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

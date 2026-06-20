import { Op } from "sequelize";
import { Loan, Book, User } from "../models/index.js";

const getToday = () => new Date().toISOString().split("T")[0];

const addOverdueFlag = (loan) => {
  const plain = loan.toJSON();
  return {
    ...plain,
    isOverdue: plain.status === "borrowed" && plain.dueDate < getToday(),
  };
};

// POST /api/loans/issue (Admin only)
export const issueBook = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }

  const { bookId, memberId, dueDate } = req.body;

  if (!bookId)
    return res
      .status(400)
      .json({ success: false, message: "Book ID is required." });
  if (!memberId)
    return res
      .status(400)
      .json({ success: false, message: "Member ID is required." });
  if (!dueDate)
    return res
      .status(400)
      .json({ success: false, message: "Due date is required." });

  try {
    const book = await Book.findByPk(bookId);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    if (book.availableCopies < 1) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No available copies for this book.",
        });
    }

    const member = await User.findByPk(memberId);
    if (!member || member.role !== "member") {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }
    if (!member.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot issue book to a deactivated member." });
    }

    const existingLoan = await Loan.findOne({
      where: { bookId, memberId, status: "borrowed" },
    });
    if (existingLoan) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This member already has an active loan for this book.",
        });
    }

    const loan = await Loan.create({
      bookId,
      memberId,
      issuedById: req.user.id,
      dueDate,
    });

    await book.update({ availableCopies: book.availableCopies - 1 });

    return res.status(201).json({
      success: true,
      message: "Book issued successfully.",
      data: { loan },
    });
  } catch (error) {
    console.error("Issue book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/loans/:id/return (Admin only)
export const returnBook = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }

  const { id } = req.params;

  try {
    const loan = await Loan.findByPk(id, {
      include: [{ model: Book, as: "book" }],
    });
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found." });
    if (loan.status === "returned") {
      return res
        .status(400)
        .json({
          success: false,
          message: "This book has already been returned.",
        });
    }

    await loan.update({ status: "returned", returnDate: getToday() });
    await loan.book.update({ availableCopies: loan.book.availableCopies + 1 });

    return res.status(200).json({
      success: true,
      message: "Book returned successfully.",
      data: { loan: addOverdueFlag(loan) },
    });
  } catch (error) {
    console.error("Return book error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/loans (Admin only) — all loans with optional filters
export const getAllLoans = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }

  const { status, overdue } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (overdue === "true") {
    where.status = "borrowed";
    where.dueDate = { [Op.lt]: getToday() };
  }

  try {
    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn"],
        },
        {
          model: User,
          as: "member",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "issuedLoans",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Loans fetched successfully.",
      data: {
        loans: loans.map(addOverdueFlag),
        pagination: { totalLoans: count, totalPages, currentPage: page, limit },
      },
    });
  } catch (error) {
    console.error("Get all loans error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/loans/my-loans — active loans and history for the logged-in member
export const getMyLoans = async (req, res) => {
  const { status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = { memberId: req.user.id };
  if (status) where.status = status;

  try {
    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Book,
          as: "book",
          attributes: [
            "id",
            "title",
            "author",
            "isbn",
            "genre",
            "coverImageUrl",
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Your loans fetched successfully.",
      data: {
        loans: loans.map(addOverdueFlag),
        pagination: { totalLoans: count, totalPages, currentPage: page, limit },
      },
    });
  } catch (error) {
    console.error("Get my loans error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/loans/:id — admin sees any loan, member sees only their own
export const getLoanById = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await Loan.findByPk(id, {
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn"],
        },
        {
          model: User,
          as: "member",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "issuedLoans",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found." });

    if (req.user.role !== "admin" && loan.memberId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    return res.status(200).json({
      success: true,
      message: "Loan fetched successfully.",
      data: { loan: addOverdueFlag(loan) },
    });
  } catch (error) {
    console.error("Get loan error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

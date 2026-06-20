import { Op } from "sequelize";
import { Loan, Book, User } from "../models/index.js";

// Helper: returns today's date as "YYYY-MM-DD"
const getToday = () => new Date().toISOString().split("T")[0];

// Helper: adds an isOverdue flag to a loan plain object
const addOverdueFlag = (loan) => {
  const plain = loan.toJSON();
  return {
    ...plain,
    isOverdue: plain.status === "borrowed" && plain.dueDate < getToday(),
  };
};

// GET /api/dashboard/admin  (Admin only)
// Returns: counts (books, members, active loans, overdue loans)
//          + 5 recently added books
//          + 5 recently borrowed books
export const getAdminDashboard = async (req, res) => {
  // Only admins can access this route
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  try {
    // --- Count statistics ---

    // Total number of books in the library
    const totalBooks = await Book.count();

    // Total number of registered members
    const totalMembers = await User.count({
      where: { role: "member" },
    });

    // Active loans = loans that have not been returned yet
    const activeLoans = await Loan.count({
      where: { status: "borrowed" },
    });

    // Overdue loans = borrowed books whose due date has already passed
    const overdueLoans = await Loan.count({
      where: {
        status: "borrowed",
        dueDate: { [Op.lt]: getToday() }, // dueDate is less than today
      },
    });

    // --- Recently added books (last 5) ---
    const recentlyAddedBooks = await Book.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["id", "title", "author", "isbn", "genre", "coverImageUrl", "availableCopies", "totalCopies", "createdAt"],
    });

    // --- Recently borrowed books (last 5 active loans) ---
    const recentlyBorrowedBooks = await Loan.findAll({
      where: { status: "borrowed" },
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn", "coverImageUrl"],
        },
        {
          model: User,
          as: "member",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully.",
      data: {
        stats: {
          totalBooks,
          totalMembers,
          activeLoans,
          overdueLoans,
        },
        recentlyAddedBooks,
        recentlyBorrowedBooks: recentlyBorrowedBooks.map(addOverdueFlag),
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/member  (Member only)
// Returns: books currently borrowed (with due dates)
//          + full borrowing history (returned books)
export const getMemberDashboard = async (req, res) => {
  // Only members can access this route
  if (req.user.role !== "member") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Members only.",
    });
  }

  try {
    // Books the member is currently borrowing (not returned yet)
    const currentLoans = await Loan.findAll({
      where: {
        memberId: req.user.id,
        status: "borrowed",
      },
      order: [["dueDate", "ASC"]], // show books due soonest first
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn", "genre", "coverImageUrl"],
        },
      ],
    });

    // All books the member has returned in the past
    const borrowingHistory = await Loan.findAll({
      where: {
        memberId: req.user.id,
        status: "returned",
      },
      order: [["returnDate", "DESC"]], // most recently returned first
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn", "genre", "coverImageUrl"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Member dashboard data fetched successfully.",
      data: {
        currentLoans: currentLoans.map(addOverdueFlag),
        borrowingHistory,
      },
    });
  } catch (error) {
    console.error("Member dashboard error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

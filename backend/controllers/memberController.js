import { Op } from "sequelize";
import { User, Loan, Book } from "../models/index.js";

const getToday = () => new Date().toISOString().split("T")[0];

const addOverdueFlag = (loan) => {
  const plain = loan.toJSON();
  return {
    ...plain,
    isOverdue: plain.status === "borrowed" && plain.dueDate < getToday(),
  };
};

// GET /api/members (Admin only)
export const getAllMembers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  const { search, isActive } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = { role: "member" };
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  try {
    const { count, rows: members } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Members fetched successfully.",
      data: {
        members,
        pagination: { totalMembers: count, totalPages, currentPage: page, limit },
      },
    });
  } catch (error) {
    console.error("Get all members error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/members/:id (Admin only)
export const getMemberById = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  const { id } = req.params;

  try {
    const member = await User.findOne({
      where: { id, role: "member" },
      attributes: { exclude: ["password"] },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Member fetched successfully.",
      data: { member },
    });
  } catch (error) {
    console.error("Get member error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/members/:id/loans (Admin only) — active loans and full history
export const getMemberLoans = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  const { id } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const member = await User.findOne({
      where: { id, role: "member" },
      attributes: { exclude: ["password"] },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const where = { memberId: id };
    if (status) where.status = status;

    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author", "isbn", "genre", "coverImageUrl"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Member loans fetched successfully.",
      data: {
        member,
        loans: loans.map(addOverdueFlag),
        pagination: { totalLoans: count, totalPages, currentPage: page, limit },
      },
    });
  } catch (error) {
    console.error("Get member loans error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/members/:id/status (Admin only) — activate or deactivate
export const toggleMemberStatus = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive (boolean) is required." });
  }

  try {
    const member = await User.findOne({
      where: { id, role: "member" },
      attributes: { exclude: ["password"] },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    await member.update({ isActive });

    return res.status(200).json({
      success: true,
      message: `Member account ${isActive ? "activated" : "deactivated"} successfully.`,
      data: { member },
    });
  } catch (error) {
    console.error("Toggle member status error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

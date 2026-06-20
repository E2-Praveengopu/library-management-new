import { dbSequelize } from "../config/database.js";
import { DataTypes } from "sequelize";


 const Loan = dbSequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'book_id',
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'member_id',
    },
    issuedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'issued_by_id',
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'issue_date',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date',
    },
    returnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'return_date',
    },
    status: {
      type: DataTypes.ENUM('borrowed', 'returned'),
      allowNull: false,
      defaultValue: 'borrowed',
    },
  },
  {
    tableName: 'loans',
    timestamps: true,
  }
);

export default Loan;
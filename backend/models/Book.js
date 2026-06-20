import { dbSequelize } from "../config/database.js";
import { DataTypes } from "sequelize";


const Book = dbSequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    genre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    totalCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'total_copies',
      validate: { min: 0 },
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'available_copies',
      validate: { min: 0 },
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cover_image_url',
    },
  },{
    tableName:"books",
    timestamps:true
  });


  export default Book;
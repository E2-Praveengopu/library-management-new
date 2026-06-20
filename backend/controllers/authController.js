import { where } from "sequelize";
import { comparePassword, hashPassword } from "../lib/bcryptHandler.js";
import { User } from "../models/index.js";
import { generateToken } from "../lib/jwtHandler.js";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName) {
    return res.status(401).json({
      message: "Please Enter the first Name",
    });
  }

  if (!lastName) {
    return res.status(401).json({
      message: "Please Enter the last name",
    });
  }

  if (!email) {
    return res.status(401).json({
      success: false,
      message: "Please enter the email",
    });
  }
  if (!password) {
    return res.status(401).json({
      success: false,
      message: "Please Enter the password",
    });
  }

  if (!role) {
    return res.status(401).json({
      success: false,
      message: "Please Enter the role",
    });
  }
  try {
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "Signup successful",
      data:{
        token
      }
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(401).json({
      success: false,
      message: "Please Enter the email",
    });
  }
  if (!password) {
    return res.status(401).json({
      success: false,
      message: "Please Enter the Password",
    });
  }
  const user = await getUser(email);
  if (user === null) {
    return res.status(401).json({
      success: false,
      message: "Email Didn't associated with any user",
    });
  }
  const hashPassword = await user.password;

  const isMatch = await comparePassword(password, hashPassword);

  if (isMatch) {
    const token = generateToken(user);
    return res.status(200).json({
      success: "true",
      message: "User logged in successfully",
      data:{
        token
      }
    });
  } else {
    return res.status(401).json({
      success: "false",
      message: "email and password didn't match",
    });
  }
};

const getUser = async (email) => {
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  return user;
};

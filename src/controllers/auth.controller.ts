import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  //noch keine DB
  res.status(201).json({ message: "User registred", email, hashedPassword });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //fake daten

  const fakeUser = {
    email: "test@bla.com",
    password: await bcrypt.hash("123456", 12), // echte bcrypt-Version
  };

  const isValid = await bcrypt.compare(password, fakeUser.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token });
};

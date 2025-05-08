import jwt from "jsonwebtoken";

export const generateToken = async (userId, res) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    if (token) {
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
      });
    }
    return token;
  } catch (error) {
    console.log("Error while generation token", error);
  }
};

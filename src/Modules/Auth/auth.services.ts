import { Request, Response } from "express";

class AuthenticationServices {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    return res.status(201).json({ message: "User Created Successfully" });
  };
}
export default new AuthenticationServices();

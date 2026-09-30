import { Request, Response } from "express";

class OrderServices {
  constructor() {}

  createOrder = async (req: Request, res: Response): Promise<Response> => {
    return res.status(201).json({ message: "Order Created Successfully" });
  };
}
export default new OrderServices();

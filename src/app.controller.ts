import express, { Request, Response } from "express";
import { Express } from "express";
import { connectionDB } from "./DB/connect";
import path from "node:path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { globalError } from "./Utils/Security/Error/global.error.utils";
import authRouter from "./Modules/Auth/auth.controller";

const limit = rateLimit({
  limit: 200,
  windowMs: 15 * 60 * 1024,
  message: "Too Many Requests , Please Try Later",
  statusCode: 429,
});

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;

  dotenv.config({ path: `${path.resolve()}/config/.env.dev` });

  app.use("/api/v1/auth", authRouter);

  await connectionDB();
  app.use(cors(), helmet(), limit, hpp(), ExpressMongoSanitize());
  app.use(globalError);

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: "Hello From Tabeebi App" });
  });

  app.all("/*dummy", (req: Request, res: Response) => {
    return res.status(404).json({ message: "Page Not Found" });
  });

  app.listen(port, () => {
    console.log(`Server Is Running : http://localhost:${port} ✈️`);
  });
};

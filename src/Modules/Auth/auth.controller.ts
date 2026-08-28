import { Router } from "express";
const router: Router = Router();
import authServices from "./auth.services";

router.post("/signup", authServices.signup);

export default router;

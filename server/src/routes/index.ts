import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ratesRouter from "./rates";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/rates", ratesRouter);

export default router;

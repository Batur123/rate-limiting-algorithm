import express, {Request, Response} from "express";
import {authMiddleware,rateLimitingMiddleware} from "../middlewares/auth_middleware";

const router = express.Router();

router.get('/private',authMiddleware,rateLimitingMiddleware(parseInt(process.env.ROUTE_PRIVATE_RATE_LIMIT_WEIGHT!,10) || 0), (req: Request,res: Response) => {
    console.log("Private route works (Route Name: /private)");
    return res.json({message: "Private routing works. (Route Name: /private)"});
});

router.get('/privateone',authMiddleware,rateLimitingMiddleware(parseInt(process.env.ROUTE_PRIVATE_ONE_RATE_LIMIT_WEIGHTparseInt!,10) || 0), (req: Request,res: Response) => {
    console.log("Private route works (Route Name: /privateone");
    return res.json({message: "Private routing works. (Route Name: /privateone)"});
});

router.get('/privatetwo',authMiddleware,rateLimitingMiddleware(parseInt(process.env.ROUTE_PRIVATE_TWO_RATE_LIMIT_WEIGHT!,10) || 0), (req: Request,res: Response) => {
    console.log("Private route works (Route Name: /privatetwo)");
    return res.json({message: "Private routing works. (Route Name: /privatetwo)"});
});

module.exports = router;

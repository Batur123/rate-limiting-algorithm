import express, {Request, Response} from 'express';
import {rateLimitingMiddleware} from '../middlewares/auth_middleware';

const router = express.Router();
router.get('/public',rateLimitingMiddleware(parseInt(process.env.ROUTE_PUBLIC_RATE_LIMIT_WEIGHT!,10)),(req: Request,res: Response) => {
    console.log("Public route works (Route Name: /public)");
    return res.json({message: "Public route works. (Route Name: /public)"});
});

router.get('/publicone',rateLimitingMiddleware(parseInt(process.env.ROUTE_PUBLIC_ONE_RATE_LIMIT_WEIGHT!,10)),(req: Request,res: Response) => {
    console.log("Public route works (Route Name: /publicone)");
    return res.json({message: "Public route works. (Route Name: /publicone)"});
});

router.get('/publictwo',rateLimitingMiddleware(parseInt(process.env.ROUTE_PUBLIC_TWO_RATE_LIMIT_WEIGHT!,10)),(req: Request,res: Response) => {
    console.log("Public route works (Route Name: /publictwo)");
    return res.json({message: "Public route works. (Route Name: /publictwo)"});
});

module.exports = router;
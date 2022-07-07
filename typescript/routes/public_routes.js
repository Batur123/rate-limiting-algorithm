"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth_middleware");
const router = express_1.default.Router();
router.get('/public', (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PUBLIC_RATE_LIMIT_WEIGHT, 10)), (req, res) => {
    console.log("Public route works (Route Name: /public)");
    return res.json({ message: "Public route works. (Route Name: /public)" });
});
router.get('/publicone', (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PUBLIC_ONE_RATE_LIMIT_WEIGHT, 10)), (req, res) => {
    console.log("Public route works (Route Name: /publicone)");
    return res.json({ message: "Public route works. (Route Name: /publicone)" });
});
router.get('/publictwo', (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PUBLIC_TWO_RATE_LIMIT_WEIGHT, 10)), (req, res) => {
    console.log("Public route works (Route Name: /publictwo)");
    return res.json({ message: "Public route works. (Route Name: /publictwo)" });
});
module.exports = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_middleware_1 = require("../middlewares/auth_middleware");
router.get('/private', auth_middleware_1.authMiddleware, (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PRIVATE_RATE_LIMIT_WEIGHT, 10) || 0), (req, res) => {
    console.log("Private route works (Route Name: /private)");
    return res.json({ message: "Private routing works. (Route Name: /private)" });
});
router.get('/privateone', auth_middleware_1.authMiddleware, (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PRIVATE_ONE_RATE_LIMIT_WEIGHTparseInt, 10) || 0), (req, res) => {
    console.log("Private route works (Route Name: /privateone");
    return res.json({ message: "Private routing works. (Route Name: /privateone)" });
});
router.get('/privatetwo', auth_middleware_1.authMiddleware, (0, auth_middleware_1.rateLimitingMiddleware)(parseInt(process.env.ROUTE_PRIVATE_TWO_RATE_LIMIT_WEIGHT, 10) || 0), (req, res) => {
    console.log("Private route works (Route Name: /privatetwo)");
    return res.json({ message: "Private routing works. (Route Name: /privatetwo)" });
});
module.exports = router;

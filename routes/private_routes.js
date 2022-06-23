const express = require('express');
const router = express.Router();
const {authMiddleware,privateRateLimitingMiddleware} = require('../middlewares/auth_middleware.js');

router.get('/private',authMiddleware,privateRateLimitingMiddleware(process.env.ROUTE_PRIVATE_RATE_LIMIT_WEIGHT), (req,res) => {
    console.log("Private route works (Route Name: /private)");
    return res.json({message: "Private routing works. (Route Name: /private)"});
});

router.get('/privateone',authMiddleware,privateRateLimitingMiddleware(process.env.ROUTE_PRIVATE_ONE_RATE_LIMIT_WEIGHT), (req,res) => {
    console.log("Private route works (Route Name: /privateone");
    return res.json({message: "Private routing works. (Route Name: /privateone)"});
});


router.get('/privatetwo',authMiddleware,privateRateLimitingMiddleware(process.env.ROUTE_PRIVATE_TWO_RATE_LIMIT_WEIGHT), (req,res) => {
    console.log("Private route works (Route Name: /privatetwo)");
    return res.json({message: "Private routing works. (Route Name: /privatetwo)"});
});

module.exports = router;

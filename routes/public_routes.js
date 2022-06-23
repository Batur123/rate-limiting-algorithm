const express = require('express');
const router = express.Router();
const {publicRateLimitMiddleware} = require('../middlewares/public_middleware.js');

router.get('/public',publicRateLimitMiddleware(process.env.ROUTE_PUBLIC_RATE_LIMIT_WEIGHT),(req,res) => {
    console.log("Public route works (Route Name: /public)");
    return res.json({message: "Public route works. (Route Name: /public)"});
});

router.get('/publicone',publicRateLimitMiddleware(process.env.ROUTE_PUBLIC_ONE_RATE_LIMIT_WEIGHT),(req,res) => {
    console.log("Public route works (Route Name: /publicone)");
    return res.json({message: "Public route works. (Route Name: /publicone)"});
});

router.get('/publictwo',publicRateLimitMiddleware(process.env.ROUTE_PUBLIC_TWO_RATE_LIMIT_WEIGHT),(req,res) => {
    console.log("Public route works (Route Name: /publictwo)");
    return res.json({message: "Public route works. (Route Name: /publictwo)"});
});

module.exports = router;
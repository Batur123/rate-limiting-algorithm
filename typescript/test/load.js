"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
const perf_hooks_1 = require("perf_hooks");
const startHeavyLoad = () => __awaiter(void 0, void 0, void 0, function* () {
    let t0 = perf_hooks_1.performance.now();
    axios.get('http://localhost:3000/private?username=admin&password=root', {
        headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJwYXNzd29yZCI6InJvb3QiLCJpYXQiOjE2NTQ3MDA3NDl9.Dj0X1N1UxaafItV9T3-pQiqc296fGFge18bopPRGRB0`
        }
    }).then(() => {
        let t1 = perf_hooks_1.performance.now();
        console.log("heavy_load.ts " + (t1 - t0) + " milliseconds.");
    }).catch((err) => {
        let t1 = perf_hooks_1.performance.now();
        console.log("heavy_load.ts " + (t1 - t0) + " milliseconds.");
        console.log(err.response.data);
    });
});
setInterval(startHeavyLoad, 100);

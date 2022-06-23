const axios = require('axios');
const { performance } = require('perf_hooks');

(async () => {
    let t0 = performance.now();
    for(let i = 0; i <= 10000; i++) {
        axios.get('http://localhost:3000/private?username=admin&password=root',{
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJwYXNzd29yZCI6InJvb3QiLCJpYXQiOjE2NTQ3MDA3NDl9.Dj0X1N1UxaafItV9T3-pQiqc296fGFge18bopPRGRB0`
            }
        }).then(r => {
            // console.log(r.data);
            // console.log("request");
        }).catch(ex => {
            // console.log(ex.response.data);
        })
    }
    let t1 = performance.now();
    console.log("heavy_load.js " + (t1 - t0) + " milliseconds.");
})();

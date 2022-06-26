const axios = require('axios');
const { performance } = require('perf_hooks');

const startHeavyLoad = async () => {
    let t0 = performance.now();

    axios.get('http://localhost:3000/private?username=admin&password=root', {
        headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJwYXNzd29yZCI6InJvb3QiLCJpYXQiOjE2NTQ3MDA3NDl9.Dj0X1N1UxaafItV9T3-pQiqc296fGFge18bopPRGRB0`
        }
    }).then(result => {
        let t1 = performance.now();
        console.log("heavy_load.js " + (t1 - t0) + " milliseconds.");
    }).catch(err => {
        let t1 = performance.now();
        console.log("heavy_load.js " + (t1 - t0) + " milliseconds.");

        console.log(err.response.data);
    });


}

setInterval(startHeavyLoad,250);
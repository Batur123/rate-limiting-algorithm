# Rate Limiting Middleware 
 Rate Limiting is hybrid version of Fixed Window Algorithm, works on public routes with IP Address and private routes with JWT, also has configurable limit-weight for every route. Can be configured from .env <br>
 MongoDB-Redis cache for reducing time for authenticate user. <br>

## Features
Custom Limit and Weights for different routes <br>
Limit and Weights can be used by both ip addresses and bucket tokens <br>
MongoDB-Redis Caching for better query performance <br>
Cluster Mode for concurrent http requests <br>

## Authenticate User Flowchart ( With Cache )
![Flowchart](https://user-images.githubusercontent.com/32031460/173140515-8a99e384-e372-43cc-a964-1a934f697c9c.png) <br>
Note: Caching will not work if user authentication is fails so wrong authentication will be result in slower http response time.

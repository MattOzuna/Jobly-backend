# Jobly Backend

This is the Express backend for Jobly, version 2.

To run the app:

    node server.js
    
To run the tests:

    npm test

## Change log

**Part 1 Understanding Code and wrote first test**  
- Wrote test for the helpers/sql  

**Part 2 Company routes filtering**  
- Added filtering for the "/companies" route with the queries: name, minEmployees, maxEmployees

**Part 3 Change Authorization**  
- Added some middleware for routes to check for isAdmin and isAdmin or signedin user matches the user specific route  

**Part 4 Jobs**  
- Added a jobs model, jsonschema and routes
- Added testing for model and routes
- Added filtering for the "/jobs" route with the queries: title, minSalary, hasEquity
- Added jobs association for the "/companies/:handle" route

**Part 5 Job Applications**  
- In progress...
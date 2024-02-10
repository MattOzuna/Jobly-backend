# Jobly Backend

This is the Express backend for Jobly, version 2.

To run the app:

    node server.js
    
To run the tests:

    npm test

## Change log

**Part 1**  
- Wrote test for the helpers/sql  

**Part 2**  
- Added filtering for the "/companies" route  

**Part 3**  
- Added some middleware for routes to check for isAdmin and isAdmin or signedin user matches the user specific route  

**Part 4**
- Added a jobs model and routes and added testing for model and routes
- Added filtering for the "/jobs" route
- Added jobs association for the "/companies/:handle" route
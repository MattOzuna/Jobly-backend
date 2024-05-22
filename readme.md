# Jobly Backend

This is the Express backend for Jobly, a mock job search app.

To run the app:

    node server.js
    
To run the tests:

    npm test
## Routes

### /auth 
- POST /auth/register
    - send JSON:  
    ```
    {
        username: "string" (must be unique),
        password: "string,
        firstName: "string",
        lastName: "string",
        email: "valid email"
    }
    ```
    - receive JSON:  
    ```
    {token, username}
    ```
- POST /auth/token
    - send JSON:  
    ```
    {username, password }
    ```
    - receive JSON:  
    ```
    {token}
    ```

### /companies
- GET /companies
    - receive JSON:  
    ```
    {companies: [
            {
                handle, 
                name, 
                description, 
                numEmployees, 
                logoUrl
            }, ...
        ]
    }
    ```
- POST /companies
    - send JSON:  
    ```
    {
        name: string (must be unique),
        handle: string (must be unique), 
        description: string,
        numEmployees: integer,
        logoUrl: string
    }
    ```
    - receive JSON:  
    ```
    {company:{
            handle, 
            name, 
            description, 
            numEmployees, 
            logoUrl
        }
    }
    ```

- GET /companies/handle
    - receive JSON:  
    ```
    {company:{
            handle, 
            name, 
            description, 
            numEmployees, 
            logoUrl
        }
    }
    ```

- PATCH /companies/handle
    - send JSON:  
    ```
    {
        name: string (must be unique),
        description: string,
        numEmployees: integer,
        logoUrl: string
    }
    ```
    - receive JSON:  
    ```
    {company:{
            handle, 
            name, 
            description, 
            numEmployees, 
            logoUrl
        }
    }
    ```
- DELETE /companies/handle
    - receive JSON:  
    ```
    {deleted:{
            handle
        }
    }
    ```
### /users
- GET /users
    - receive JSON:  
    ```
    {users: [
            {
                username,
                firstName, 
                lastName, 
                email,
                isAdmin
            }, ...
        ]
    }
    ```
- POST /users
    - send JSON:  
    ```
    {
        username: string (must be unique),
        password: string, 
        firstName: string,
        lastName: string,
        email: string,
        isAdmin: boolean
    }
    ```
    - receive JSON:  
    ```
    {users:[{
                username,
                firstName, 
                lastName, 
                email,
                isAdmin
            }, ...]
    }
    ```

- GET /users/username
    - receive JSON:  
    ```
    {users:{
                username,
                firstName, 
                lastName, 
                email,
                isAdmin
            }
    }
    ```

- PATCH /users/username
    - send JSON:  
    ```
    {
        password: string, 
        firstName: string,
        lastName: string,
        email: string
    }
    ```
    - receive JSON:  
    ```
    {user:{
            username,
            password, 
            firstName,
            lastName,
            email
        }
    }
    ```
- POST /users/username/jobs/id
    - receive JSON:  
    ```
    {application:{
                username,
                jobId
            }
    }
    ```

- DELETE /user/username
    - receive JSON:  
    ```
    {deleted:{
            username
        }
    }
    ```

### /jobs
- GET /jobs
    - receive JSON:  
    ```
    {jobs: [
            {
                id,
                title,
                salary,
                equity,
                companyHandle
            }, ...
        ]
    }
    ```
- POST /jobs
    - send JSON:  
    ```
    {
        title: string (must be unique),
        salary: integer, 
        equity: integer,
        companyHandle: string,
    }
    ```
    - receive JSON:  
    ```
    {job:{
            id, 
            title, 
            salary, 
            equity, 
            companyHandle
        }
    }
    ```

- GET /jobs/id
    - receive JSON:  
    ```
    {job:{
            id, 
            title, 
            salary, 
            equity, 
            companyHandle
        }
    }
    ```

- PATCH /jobs/id
    - send JSON:  
    ```
    {
            title, 
            salary, 
            equity, 
    }
    ```
    - receive JSON:  
    ```
    {job:{
            id, 
            title, 
            salary, 
            equity, 
            companyHandle
        }
    }
    ```
- DELETE /jobs/id
    - receive JSON:  
    ```
    {deleted:{
            id
        }
    }
    ```

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
- Added a route at POST /users/:username/jobs/:id that allows that user to apply for a job. That route should return JSON like:  

`{ applied: jobId }`
- Change the output of the get-all-info methods and routes for users so those include the a field with a simple list of job IDs the user has applied for:

`{ ..., jobs: [ jobId, jobId, ... ] }`

- Added finally to authenticateJWT middleware
- Added username to register route to make using the routes easier

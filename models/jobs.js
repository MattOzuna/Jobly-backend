"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Jobs {

    /**Create a job, insert into db, and return newly created job
     * 
     * data should be{title, salary, equity, company_handle}
     * 
     * return value should be {id, title, salary, equity, company_handle}
     */

    static async create ({title, salary, equity, companyHandle}) {
        const newJob = await db.query(
            `INSERT INTO jobs 
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle as "companyHandle"`,
            [title, salary, equity, companyHandle]
        );
        return newJob.rows[0];
    }

    /**Finds all jobs
     * 
     * Returns [{id, title, salary, equity, company_handle}, ...]
     */
    static async findAll(){
        const jobs = await db.query(
            `SELECT id, 
                    title, 
                    salary, 
                    equity, 
                    company_handle as "companyHandle"
            FROM jobs`
        );
        return jobs.rows
    }

    /**Find some jobs based on queries passed in
   * 
   * Starts with base query and adds WHERE statements based on what was receive in queries object
   * 
   * Returns [{id, title, salary, equity, companyHandle}, ...]
   */

    static async findSome(queries){
        const {minSalary, hasEquity} = queries

        let query = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle as "companyHandle"
                    FROM jobs `;
        let where = [];
        let queryValues = [];
        

        if(queries.title){
            queryValues.push('%'+queries.title+'%')
            where.push(`title ILIKE $${queryValues.length}`)
        }

        if(minSalary){
            queryValues.push(minSalary)
            where.push(`salary >= $${queryValues.length}`)
        }

        if(hasEquity === 'true'){
            queryValues.push(0)
            where.push(`equity > $${queryValues.length}`)
        }

        if(where.length > 0){
            query += 'WHERE '+ where.join(' AND ');
        }

        const results = await db.query(query, queryValues);
        return results.rows;
    }

    /**Finds a job by id
     * 
     * Throws error if id doesn't exist
     * 
     * Returns {id, title, salary, equity, company_handle}
     */

    static async get(id){
        const job = await db.query(
            `SELECT id, 
                    title, 
                    salary, 
                    equity, 
                    company_handle
            FROM jobs
            WHERE id = $1`,
            [id]
        );
        if (!job.rows[0]) throw new NotFoundError(`No job with id = ${id}`)
        return job.rows[0]
    }

    /** Update jobs data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(
            data, 
            {
                companyHandle: "company_handle"
            });
        const idVarIdx = "$" + (values.length+1);
        const jobQuery =`UPDATE jobs 
                        SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id, title, salary, equity, company_handle as "companyHandle"`;

        const job = await db.query(jobQuery, [...values, id])

        if (job.rows.length === 0) throw new NotFoundError(`No job with id = ${id}`)

        return job.rows[0]
    }

    /**Delete a job by id
     * 
     * Throws error if id doesn't exist
     * 
     * Returns {id, title}
     */

    static async remove(id){
        const job = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id, title`,
            [id]
        );
        if (job.rows.length === 0) throw new NotFoundError(`No job with id = ${id}`)
        return job.rows[0]
    }
}

module.exports = Jobs;
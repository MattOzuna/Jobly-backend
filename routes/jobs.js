"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin} = require("../middleware/auth");
const Jobs = require("../models/jobs");

const jobsNewSchema = require("../schemas/jobsNew.json");
const jobsUpdateSchema = require("../schemas/jobsUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */
router.post('/', ensureLoggedIn, ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobsNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }

        const job = await Jobs.create(req.body)
        return res.status(201).json({job})
    }catch(err){
        return next(err)
    }
})

/** PATCH /id { job } =>  { job }
 * 
 * patches job data
 *
 * data can be { title, salary, equity, companyHandle }
 * 
 * requires {title, companyHandle}
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */
router.patch('/:id', ensureLoggedIn, ensureAdmin, async (req,res,next) => {
    try{
        const validator = jsonschema.validate(req.body, jobsUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }
        const job = await Jobs.update(req.params.id, req.body)
        return res.json({job})
    }catch(err){
        return next(err)
    }
})

/** GET /  => [{job}, {job}, ...]
 * 
 * 
 *  * Can filter on provided search filters:
 * - minSalary
 * - hasEquity as a Boolean
 * - title (will find case-insensitive, partial matches)
 * 
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async (req, res, next) => {
    try {
        if(Object.keys(req.query).length === 0){
            const jobs = await Jobs.findAll();
            return res.json({ jobs });
        }
        else{
            const jobs = await Jobs.findSome(req.query)
            return res.json({jobs})
        }
    } catch (err) {
      return next(err);
    }
  });

/** GET /id  =>
 *   { job: { id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get('/:id', async (req,res,next) => {
    try{
        const job = await Jobs.get(req.params.id)
        return res.json({ job })
    }catch(err){
        return next(err)
    }
})

/** DELETE /id  =>  { deleted: {id, title} }
 *
 * Authorization: Admin
 */

router.delete('/:id', ensureLoggedIn, ensureAdmin, async (req,res,next) =>{
    try{
        const deletedJob = await Jobs.remove(req.params.id)
        return res.json({deleted: {
            id: deletedJob.id,
            title: deletedJob.title
        }})
    }catch (err){
        return next(err)
    }
})


module.exports = router;
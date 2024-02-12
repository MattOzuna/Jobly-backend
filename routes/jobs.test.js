"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', () =>{
    const newJob = {
        title: "New",
        salary: 100000,
        equity: 0,
        companyHandle: "c1",
      };
    test('works for admins', async () => {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toMatchObject({
            job: {
                title: "New",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            }
        });
    })

    test('not admin', async () => {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
    })

    test('bad request missing data', async () =>{
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "badData",
                salary: "not int",
                equity: "bad data",
                companyHandle: "not a company"
            })
        expect(resp.statusCode).toEqual(401);
    })
})

/************************************** Get /jobs */

describe('GET /jobs', () =>{
    test('get all jobs', async ()=>{
        const resp = await request(app).get('/jobs')

        expect(resp.statusCode).toEqual(200)
        expect(resp.body.jobs[0]).toMatchObject({
            title: 'j1',
            salary: 100000,
            equity: '0',
            companyHandle: 'c1'
        })
        expect(resp.body.jobs[1]).toMatchObject({
            title: 'j2',
            salary: 200000,
            equity: '0',
            companyHandle: 'c1'
        })
        expect(resp.body.jobs[2]).toMatchObject({
            title: 'j3',
            salary: 105000,
            equity: '0.5',
            companyHandle: 'c3'
        })
    })

    test('get all jobs with minSalary 100001', async ()=>{
        const resp = await request(app).get('/jobs?minSalary=100001&hasEquity=false')

        expect(resp.statusCode).toEqual(200)
        expect(resp.body.jobs[0]).toMatchObject({
            title: 'j2',
            salary: 200000,
            equity: '0',
            companyHandle: 'c1'
        })
        expect(resp.body.jobs[1]).toMatchObject({
            title: 'j3',
            salary: 105000,
            equity: '0.5',
            companyHandle: 'c3'
        })
    })
})

/************************************** Get /jobs/id */

describe('GET /jobs/id', () => {
    test('get job by id', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        ) 
        const resp = await request(app).get(`/jobs/${idArr.rows[0].id}`)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            job: {
                id: idArr.rows[0].id,
                title: 'j2',
                salary: 200000,
                equity: '0',
                company_handle: 'c1'
            }
        })
    })
    test('invalid job id', async () => {
        const idArr = await db.query('SELECT id FROM jobs')
        //looks for one more than the current max id
        const resp = await request(app).get(`/jobs/${idArr.rows[idArr.rows.length - 1 ].id +1}`)
        expect(resp.statusCode).toEqual(404)
    })
})

/************************************** Patch /jobs/id */

describe('PATCH /jobs/id', () => {
    const newJob = {
        title: "New",
        salary: 100000,
        equity: 0.7,
    };
    const newJobWithRequiredOnly = {
        title: "New"
    };
    test('update job data as admin', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        )
        const resp = await request(app)
            .patch(`/jobs/${idArr.rows[0].id}`)
            .send(newJob)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            job: {
                id: idArr.rows[0].id,
                title: "New",
                salary: 100000,
                equity: "0.7",
                companyHandle: "c1",
            }
        })
    })

    test('update job title data only as admin', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        )
        const resp = await request(app)
            .patch(`/jobs/${idArr.rows[0].id}`)
            .send(newJobWithRequiredOnly)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            job: {
                id: idArr.rows[0].id,
                title: "New",
                salary: 200000,
                equity: "0",
                companyHandle: "c1",
            }
        })
    })    

    test('bad request missing data', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        )
        const resp = await request(app)
            .patch(`/jobs/${idArr.rows[0].id}`)
            .send({})
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(400)
    })    

    test('not admin', async () =>{
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        )
        const resp = await request(app)
            .patch(`/jobs/${idArr.rows[0].id}`)
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401)
    })
})
/************************************** Delete /jobs/id */

describe('DELETE /jobs/id', () => {
    test('works for admin', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j1'`
        )
        const resp = await request(app)
            .delete(`/jobs/${idArr.rows[0].id}`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            deleted: {
                id: idArr.rows[0].id,
                title: 'j1'
            }
        })
    })
    test('not admin', async () => {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j1'`
        )
        const resp = await request(app)
            .delete(`/jobs/${idArr.rows[0].id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401)
    })

    test('invalid job id', async () => {
        const idArr = await db.query('SELECT id FROM jobs')
        //looks for one more than the current max id
        const resp = await request(app)
        .delete(`/jobs/${idArr.rows[idArr.rows.length - 1 ].id +1}`)
        .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(404)
    })
})


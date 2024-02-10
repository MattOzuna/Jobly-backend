"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Jobs = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
    const newJob = {
      title: "New",
      salary: 100000,
      equity: "0",
      companyHandle: "c1",
    };
  
    test("works", async function () {
      let job = await Jobs.create(newJob);
      expect(job).toMatchObject(newJob);
  
      const result = await db.query(
            `SELECT title, salary, equity, company_handle as "companyHandle"
             FROM jobs
             WHERE title = 'New'`);
      expect(result.rows).toEqual([
        {
            title: "New",
            salary: 100000,
            equity: '0',
            companyHandle: "c1",
        }]);
    });
  });

  /************************************** findAll */

  describe("findAll", function () {
    test("works: no filter", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs`
        )
        
        let jobs = await Jobs.findAll();
        expect(jobs).toEqual([
            {   
                id: idArr.rows[0].id,
                title: "j1",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            },
            {   
                id: idArr.rows[1].id,
                title: "j2",
                salary: 200000,
                equity: "0",
                companyHandle: "c1"
            },
            {   
                id: idArr.rows[2].id,
                title: "j1",
                salary: 100100,
                equity: "0.5",
                companyHandle: "c2"
            }
        ])
    })
})

  /************************************** findSome */
  describe("findSome", function () {
    test("works: with minSalary filter", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs`
        )
        let jobs = await Jobs.findSome({minSalary: 100001});
        expect(jobs).toEqual([
            {   
                id: idArr.rows[1].id,
                title: "j2",
                salary: 200000,
                equity: "0",
                companyHandle: "c1"
            },
            {   
                id: idArr.rows[2].id,
                title: "j1",
                salary: 100100,
                equity: "0.5",
                companyHandle: "c2"
            }
        ]);
    });
    test("works: with title filter", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs`
        )
        let jobs = await Jobs.findSome({title: 'j1'});
        expect(jobs).toEqual([
            {   
                id: idArr.rows[0].id,
                title: "j1",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            },
            {   
                id: idArr.rows[2].id,
                title: "j1",
                salary: 100100,
                equity: "0.5",
                companyHandle: "c2"
            }
        ]);
    });
    test("works: with title filter", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs`
        )
        let jobs = await Jobs.findSome({hasEquity: 'true'});
        expect(jobs).toEqual([
            {   
                id: idArr.rows[2].id,
                title: "j1",
                salary: 100100,
                equity: "0.5",
                companyHandle: "c2"
            }
        ]);
    });
    
    test("works: with all three filters", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs`
        )
        let jobs = await Jobs.findSome({
            title: 'j1',
            minSalary: 100001,
            hasEquity: 'false'});
        expect(jobs).toEqual([
            {   
                id: idArr.rows[2].id,
                title: "j1",
                salary: 100100,
                equity: "0.5",
                companyHandle: "c2"
            }
        ]);
    });

})

  /************************************** get */


  describe("get", function () {

    test("works", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j1'`
        )   
        let jobs = await Jobs.get(idArr.rows[0].id);
        expect(jobs).toEqual({
            id: idArr.rows[0].id,
            title: "j1",
            salary: 100000,
            equity: "0",
            company_handle: "c1"
        });
    });
  
    test("not found if no such job id", async function () {
        try {
            const idArr = await db.query(
                `SELECT id FROM jobs`
            ) 
            //adding one to the highes id so it will always fail
            const badId = idArr.rows[2].id+1
            await Jobs.get(badId);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
  });

  /************************************** remove */

describe("remove", function () {
    test("works", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        ) 
        await Jobs.remove(idArr.rows[0].id);
        const res = await db.query(
            "SELECT id FROM jobs WHERE title = 'j2'");
        expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job id", async function () {
        try {
            const idArr = await db.query(
                `SELECT id FROM jobs`
            ) 
            //adding one to the highes id so it will always fail
            const badId = idArr.rows[2].id+1
            await Jobs.remove(badId);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
  });

  /************************************** update */

describe("update", function () {
    const updateData = {
        title: "New",
        salary: 100000,
        equity: "0",
    };
    test("works", async function () {
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        ) 
        let job = await Jobs.update(idArr.rows[0].id, updateData);
        expect(job).toMatchObject({
            id: idArr.rows[0].id,
            ...updateData,
        });
    
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title = 'New'`);
        expect(result.rows).toEqual([{
            id: idArr.rows[0].id,
            title: "New",
            salary: 100000,
            equity: "0",
            companyHandle: "c1",
        }]);
    });
    
    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "New",
            salary: null,
            equity: null
        };
        const idArr = await db.query(
            `SELECT id FROM jobs WHERE title = 'j2'`
        ) 
        let job = await Jobs.update(idArr.rows[0].id, updateDataSetNulls);
        expect(job).toMatchObject({
            id: idArr.rows[0].id,
            ...updateDataSetNulls,
        });
    
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title = 'New'`);
        expect(result.rows).toEqual([{
            id: idArr.rows[0].id,
            title: "New",
            salary: null,
            equity: null,
            companyHandle: "c1",
        }]);
      });

      test("not found if no such job id", async function () {
        try {
            const idArr = await db.query(
                `SELECT id FROM jobs`
            ) 
            //adding one to the highes id so it will always fail
            const badId = idArr.rows[2].id+1
            await Jobs.update(badId, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        try {
            const idArr = await db.query(
                `SELECT id FROM jobs`
            ) 
            await Jobs.update(idArr.rows[0].id, {});
            fail();
        } catch (err) {
            console.log(err.message)
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});
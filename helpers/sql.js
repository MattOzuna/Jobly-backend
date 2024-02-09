const { BadRequestError } = require("../expressError");
const db = require('../db')

// Takes data passed as an object and converts the keys into a string of keys 
// and values into an array of values for use in an SQL query.
// This is used in both the user and company models

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


const sqlForNameQuery = async (name) => {
    const result = await db.query(`
    SELECT handle, 
      name, 
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
    FROM companies
    WHERE name ILIKE $1`,
  ['%'+name+'%']);
  return result.rows
}

const sqlForMinQuery = async (min) => {
    const result = await db.query(`
    SELECT handle, 
      name, 
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
    FROM companies
    WHERE num_employees > $1`,
    [min]);
  return result.rows
}

const sqlForMaxQuery = async (max) => {
    const result = await db.query(`
    SELECT handle, 
      name, 
      description,
      num_employees AS "numEmployees",
      logo_url AS "logoUrl"
    FROM companies
    WHERE num_employees < $1`,
    [max]);
  return result.rows
}

module.exports = { 
  sqlForPartialUpdate,
  sqlForNameQuery,
  sqlForMinQuery, 
  sqlForMaxQuery
};

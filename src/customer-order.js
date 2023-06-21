"use strict";

const mysql = require("mysql");

const host = process.env.DB_ENDPOINT;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const user = process.env.DB_USERNAME;

module.exports.handler = async (event) => {
  const connection = mysql.createConnection({
    host,
    user,
    password,
    database,
  });
  await connectToMySQL(connection);
  console.log("MySQL connection successful");
  const id = event.pathParameters.order_id;
  const result = await getCustomerOrderDetail(id, connection);
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: result,
    }),
  };
  connection.end();

  return response;
};

async function getCustomerOrderDetail(id, connection) {
  const results = await executeQuery(
    connection,
    `SELECT * FROM orders WHERE Id = '${id}'`
  );
  console.log(results);
  return results;
}

function connectToMySQL(connection) {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function executeQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

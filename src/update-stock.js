"use strict";
const mysql = require("mysql");

const host = process.env.DB_ENDPOINT;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const user = process.env.DB_USERNAME;

exports.handler = async (event) => {
  const connection = mysql.createConnection({
    host,
    user,
    password,
    database,
  });
  await connectToMySQL(connection);
  console.log("MySQL connection successful");

  const { Records } = event;

  await updateProductStock(Records, connection);
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: "Stock updated successfully",
    }),
  };

  connection.end();

  return response;
};

async function updateProductStock(Records, connection) {
  for (const record of Records) {
    const { productId, quantity } = JSON.parse(record.body);
    await executeQuery(
      connection,
      `UPDATE product SET Stock=${quantity} WHERE Id=${productId}`
    );
  }
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

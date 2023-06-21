"use strict";
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const mysql = require("mysql");

const host = process.env.DB_ENDPOINT;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const user = process.env.DB_USERNAME;
const client = new SQSClient({ region: "us-east-1" });
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

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
  await processOrder(Records, connection);

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: "Message processed successfully",
    }),
  };

  connection.end();

  return response;
};

async function processOrder(Records, connection) {
  for (const record of Records) {
    const { productId, quantity, price, customerId } = JSON.parse(record.body);
    const total = quantity * price;
    const results = await executeQuery(
      connection,
      `INSERT INTO orders (CustomerId, ProductId, Quantity, Total) \
        Values (${customerId}, ${productId}, ${quantity}, ${total})`
    );
    const updateStockMessageInput = {
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify({ productId, quantity }),
    };
    await client.send(new SendMessageCommand(updateStockMessageInput));
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

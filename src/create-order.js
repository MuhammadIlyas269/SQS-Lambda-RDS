"use strict";

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const client = new SQSClient({ region: "us-east-1" });
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

module.exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  await createOrder({ ...data });

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: "Your order is being processed",
    }),
  };
  return response;
};

async function createOrder({ price, productId, quantity, customerId }) {
  const input = {
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify({
      price,
      productId,
      quantity,
      customerId,
    }),
  };
  const command = new SendMessageCommand(input);
  const response = await client.send(command);
  return response;
}

// {
//     "productId": 2,
//     "price": 10,
//     "quantity": 11,
//     "customerId": 2
//   }

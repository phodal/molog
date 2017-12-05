const uuid = require('uuid');
const AWS = require('aws-sdk');
const superstruct =  require('superstruct');
let struct = superstruct.struct;

const Log = struct({
  data: 'string',
  env: 'string',
  component: 'string'
})

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {

  const timestamp = new Date().getTime();
  const parsedData = JSON.parse(event.body);
  console.log(event, parsedData)
  if (!Log.test(parsedData)) {
    let result = Log.validate(parsedData)
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: {
        data: event.body,
        error: result.toString(),
        event: event
      }
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      data: parsedData.data,
      env: parsedData.env,
      component: parsedData.component,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the log item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};

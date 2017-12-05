const uuid = require('uuid');
const AWS = require('aws-sdk');
const superstruct =  require('superstruct');
let struct = superstruct.struct;
let stringify = require('json-stringify-safe');

const Log = struct({
  data: 'string',
  env: 'string',
  component: 'string'
})

const dynamoDb = new AWS.DynamoDB.DocumentClient();

let Stringify = function (originData) {
// Note: cache should not be re-used by repeated calls to JSON.stringify.
  let cache = [];
  JSON.stringify(originData, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // Enable garbage collection
  return originData;
};

module.exports.handler = (event, context, callback) => {

  const timestamp = new Date().getTime();
  const parsedData = JSON.parse(event.body);
  if (!Log.test(parsedData)) {
    let result = Log.validate(parsedData)
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: Stringify(result)
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      data: parsedData.data,
      env: parsedData.env,
      component: component,
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

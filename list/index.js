const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = (event, context, callback) => {
  let env = event.pathParameters.env;
  let component = event.pathParameters.component;
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    FilterExpression: 'env = :env and component = :component',
    ExpressionAttributeValues: {
      ':env': env,
      ':component': component,
    }
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'couldn\'t fetch the logs.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
};

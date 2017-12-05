const superstruct = require('superstruct');
let struct = superstruct.struct;

const Log = struct({
  data: 'string',
  env: 'string',
  component: 'string'
})

let result = Log.validate({})

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

result[0].errors = Stringify(result)[0].errors
console.log(Stringify(result)[0])

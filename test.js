const superstruct =  require('superstruct');
let struct = superstruct.struct;

const Log = struct({
  data: 'string',
  env: 'string',
  component: 'string'
})

let result = Log.validate({})
console.log(result.toString())
const { message, path, data, type, value } = result
log({ message, path, data, type, value })

function log(data) {
console.log(JSON.stringify(data, null ,2))
}

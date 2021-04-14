module.exports.handler = async() => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Content-Type': 'text/plain'
    },
    body: 'Hello'

  }
}

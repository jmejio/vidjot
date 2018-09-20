if(process.env.NODE_ENV === 'production') {
  module.exports = {mongoURI: 'mongodb://juan123:juan123@ds261342.mlab.com:61342/vidjot-prod'}
} else {
  module.exports = {mongoURI: 'mongodb://localhost:27017/vidjot-dev'}
}

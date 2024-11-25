const { MongoClient, ObjectId } = require('mongodb')

const url = 'mongodb+srv://rjsdnmm1230:1234@cluster0.rzo2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
let connectDB = new MongoClient(url).connect()

module.exports = connectDB
const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const cors = require('./cors');
const env = require('../.env');
const authFilter = require('../services/authenticationFilter')

const apiRouter = express.Router()
	.use(authFilter);

const server = express()
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json())
	.use(cors);

consign()
	.include('src/api')
	.then('src/controllers')
	.into(server, apiRouter);

server.use('/api', apiRouter);

server.listen(env.PORT, function () {
	console.log(`Backend running on port ${env.PORT}`);
})

module.exports = server;
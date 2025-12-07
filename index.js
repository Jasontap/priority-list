require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./api');
const client = require('./db/client');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = process.env;
const {findUserByUsername} = require('./db');

const server = express();

const PORT = process.env.PORT || 3000;

server.use(morgan('dev'));
server.use(express.json());
server.use(cors())

server.use((req, res, next) => {
  console.log('HITTING SERVER');
  next();
})

server.use(async (req, res, next) => {
  try {
    const prefix = 'Bearer ';
    const auth = req.get('Authorization');
    
    if (auth) {
      const token = auth.slice(prefix.length);
    
      const userInfo = jwt.verify(token, SECRET_KEY);
      
      req.user = userInfo;
      next(); 
    } else {
      next();
    }
  } catch(ex) {
    console.log('error attaching user to request.');
    next({
      message: 'Error attaching user to the request.',
      error: true,
      errorCode: ex
    })
  }
})

server.use('/api', router);

server.use('*', (req, res, next) => {
  res.send({
    data: [],
    message: 'SOOORY THAT ROUTE DOES NOT EXIST....YET',
    error: true
  })
})

server.use((error, req, res, next) => {
  console.log(error)
  res.send(error)
})

server.listen(PORT, () => {
  client.connect();
  console.log(`Server up and running on port: ${PORT}`)
})

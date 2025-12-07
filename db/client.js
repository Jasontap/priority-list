const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo-list';

// Mac client
const client = new Client({connectionString});

// Universal client
// const client = new Client({
//   host: 'localhost',
//   port: 5432,
//   database: 'todo-list',
//   user: 'postgres',
//   password: 'postgres',
// })

module.exports = client;

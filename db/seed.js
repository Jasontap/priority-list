const client = require('./client');
const {
  getAllTodos,
  createTodo,
  createUser,
  createList,
  getListsByUserId,
  moveTodoToTail
} = require('./');


const dropTables = async () => {
  try {
    console.log('Dropping tables.')
    await client.query(`
      DROP TABLE IF EXISTS todos;
      DROP TABLE IF EXISTS lists;
      DROP TABLE IF EXISTS users;
    `)
    console.log('Finished dropping tables.')
  } catch(ex) {
    console.log('error in dropping tables!');
    console.error(ex);
  }
}

// TABLES
// users, lists, todos

const createTables = async () => {
  try {
    console.log('Creating tables.')
    // need this extension if using UUID generator (see on user table below)
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `)
    
    // check out the uuid for the user_id value
    // email has constraint to verify the email has proper formatting
    // there's other options to verify
    
    // make sure any reference to another table's uuid column also has the uuid datatype
    await client.query(`
      CREATE TABLE users (
        user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
        name VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE NOT NULL
        CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
        password VARCHAR NOT NULL
      );
      
      CREATE TABLE lists (
        list_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        owner_id uuid REFERENCES users (user_id)
      );
      
      CREATE TABLE todos (
        todo_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        note VARCHAR DEFAULT '',
        "creatorId" uuid REFERENCES users (user_id),
        list_id SERIAL REFERENCES lists (list_id),
        prev_id INTEGER REFERENCES todos(todo_id) ON DELETE SET NULL,
        next_id INTEGER REFERENCES todos(todo_id) ON DELETE SET NULL
      );
      
    `);
    console.log('Finished creating tables.')
  } catch(ex) {
    console.log('error creating tables!');
    console.error(ex);
  }
}



const createInitialUsers = async () => {
  try {
    console.log('Creating Initial Users')
    const usersToCreate = [
      {
        name: 'Jason',
        email: 'jason@email.com',
        password: 'jason123'
      },
      {
        name: 'Patty',
        email: 'patty@email.com',
        password: 'patty123'
      },
      {
        name: 'Cecilia',
        email: 'cecilia@email.com',
        password: 'cecilia123'
      }
    ]
    
    await Promise.all(usersToCreate.map(createUser))
    
    console.log('Finished Creating initial Users.')
  } catch(ex) {
    console.log('error creating initial users!');
    console.error(ex);
  }
}

const createInitialTodos = async () => {
  try{
    console.log('Creating initial todos and respective lists')
    const { rows: [user1, user2, user3] } = await client.query(`
      SELECT * FROM users;
    `);
    
    // USER #1 todo seeding (two different lists)
    await createList({title: 'User 1 List 1', ownerID: user1.user_id});
    await createTodo({title: 'Go Running.', comment: '1- comment', creatorId: user1.user_id, listId: 1 });
    await createTodo({title: 'Relax.', comment: '', creatorId: user1.user_id, listId: 1});
    await createTodo({title: 'Study.', comment: '1- comment', creatorId: user1.user_id, listId: 1 });
    await createTodo({title: 'work.', comment: '', creatorId: user1.user_id, listId: 1});
    await createTodo({title: 'blah', comment: '1- comment', creatorId: user1.user_id, listId: 1 });

    await createList({title: 'User 1 List 2', ownerID: user1.user_id});
    await createTodo({title: 'Replace Tires.', comment: '', creatorId: user1.user_id, listId: 2 });
    await createTodo({title: 'Prep lecture.', comment: '1- comment', creatorId: user1.user_id, listId: 2 });
    
    // USER #2 todo seeding (two different lists)
    await createList({title: 'User 2 List 1', ownerID: user2.user_id});
    await createTodo({title: 'Go Running - 2.', comment: '2- comment', creatorId: user2.user_id, listId: 3 });
    await createTodo({title: 'Relax - 2.', comment: '2- comment', creatorId: user2.user_id, listId: 3 });
    await createTodo({title: 'Study - 2.', comment: '2- comment', creatorId: user2.user_id, listId: 3 });
    
    await createList({title: 'User 2 List 2', ownerID: user2.user_id});
    await createTodo({title: 'Replace Tires - 2.', comment: '2- comment', creatorId: user2.user_id, listId: 4 });
    await createTodo({title: 'Prep lecture - 2.', comment: '2- comment', creatorId: user2.user_id, listId: 4 });
    
    // USER #3 todo seeding (two different lists)
    await createList({title: 'User 3 List 2', ownerID: user3.user_id});
    await createTodo({title: 'Go Running - 3.', comment: '3- comment', creatorId: user3.user_id, listId: 5 });
    await createTodo({title: 'Relax - 3.', comment: '3- comment', creatorId: user3.user_id, listId: 5 });
    await createTodo({title: 'Study - 3.', comment: '3- comment', creatorId: user3.user_id, listId: 5 });
    
    await createList({title: 'User 3 List 2', ownerID: user3.user_id});
    await createTodo({title: 'Replace Tires - 3.', comment: '3- comment', creatorId: user3.user_id, listId: 6 });
    await createTodo({title: 'Prep lecture - 3.', comment: '3- comment', creatorId: user3.user_id, listId: 6 });
    
    await moveTodoToTail(1, 1)
    await moveTodoToTail(3, 1)
    
    console.log('Finished creating initial todos and respective lists')
    
  } catch(ex) {
    console.log('error creating initial todos!');
    console.error(ex);
  }
}




const buildDB = async() => {
  try {
    console.log('Starting to Build the Database!');
    
    client.connect();
    console.log('-----------------------------------------------')
    await dropTables();
    console.log('-----------------------------------------------')
    await createTables();
    console.log('-----------------------------------------------')
    await createInitialUsers();
    console.log('-----------------------------------------------')
    await createInitialTodos();
    console.log('-----------------------------------------------')
    
    console.log('Finished Building DB!');
    
    client.end();
  } catch(ex) {
    console.log('error building the DB.');
    console.error(ex);
  }
}


buildDB();

const client = require('./client');

const getAllTodos = async () => {
  try {
    const {rows} = await client.query(`
      SELECT * FROM todos;
    `)
    
    return rows;
  } catch(ex) {
    console.log('error in getAllTodos adapter!');
  }
}

const createTodo = async ({title, comment, creatorId, listId}) => {
  
  try {
    
    // -- Find current tail:
    const {rows: [tailId]} = await client.query(`
      SELECT todo_id FROM todos 
      WHERE "creatorId" = $1 AND prev_id IS NULL AND list_id = $2;
    `, [creatorId, listId]);

    const {rows: [newTodo]} = tailId ? (
      // -- Insert new todo:
      await client.query(`
        INSERT INTO todos ("creatorId", title, next_id, prev_id, list_id)
        VALUES ($1, $2, $3, NULL, $4)
        RETURNING *;    
      `, [creatorId, title, tailId.todo_id, listId])
    ) : (
      await client.query(`
        INSERT INTO todos ("creatorId", title, next_id, prev_id, list_id)
        VALUES ($1, $2, NULL, NULL, $3)
        RETURNING *;    
      `, [creatorId, title, listId])
    )

      // -- Update old tail:
    let oldTail;
    if (tailId) {
      oldTail = await client.query(`
        UPDATE todos 
        SET prev_id = ${newTodo.todo_id} 
        WHERE todo_id = ${tailId.todo_id}
        RETURNING *;
      `);
    }

    // const {rows: [todo]} = await client.query(`
    //   INSERT INTO todos(title, comment, "creatorId", list_id, prev_id, next_id)
    //   VALUES ($1, $2, $3, $4, $5, $6)
    //   RETURNING *;
    // `, [title, comment, creatorId, listId, prevId, nextId]);
    
    return newTodo;
  } catch(ex) {
    console.log('error in createTodo adapter!');
    console.error(ex);
  }
}

const getTodosByUserId = async (userId) => {
  try {
    const { rows: todos } = await client.query(`
        WITH RECURSIVE ordered AS (
          SELECT todo_id, list_id, title, note, prev_id, next_id
          FROM todos
          WHERE "creatorId" = $1 AND prev_id IS NULL   -- head item
          
          UNION ALL
          
          SELECT t.todo_id, t.list_id, t.title, t.note, t.prev_id, t.next_id
          FROM todos t
          INNER JOIN ordered o ON t.todo_id = o.next_id
        )
        SELECT * FROM ordered;
    `,
      // `
      //   SELECT * FROM todos
      //   WHERE "creatorId" = $1;
      // `
      [userId]
    );


    return todos;
  } catch(ex) {
    console.log('error in getTodosByUserId adapter!');
    console.error(ex);
  }
}

const removeTodo = async (todoId, userId) => {
  try {
    await client.query(`
      DELETE FROM todos
      WHERE todo_id = $1
      AND "creatorId" = $2;
    `, [todoId, userId])
    
  } catch(ex) {
    console.log('error removing todo from database in DB adapter');
    console.error(ex);
  }
}

const getTodoByTodoId = async (todoId) => {
  try {
    const {rows: [todo]} = await client.query(`
      SELECT * FROM todos
      WHERE todo_id = $1;
    `, [todoId])
    
    return todo;
  } catch(ex) {
    console.log('error searching for todo by todoID in the DB adapter');
    console.error(ex);
  }
}

const updateTodo = async (todoId, title) => {
  try {
    await client.query(`
      UPDATE todos
      SET title = $1
      WHERE todo_id = $2;
    `, [title, todoId]);
  } catch(ex) {
    console.log('error updating todo in DB adapter');
    console.error(ex);
  }
}

const attachTodoNote = async (todoId, noteText) => {
  try {
    await client.query(`
      UPDATE todos
      SET comment = $1
      WHERE todo_id = $2;
    `, [noteText, todoId]);
    
  } catch(ex) {
    console.log('error attaching note to todo in DB adapter')
    console.error(ex);
  }
}

const clearTodoNote = async (todoId) => {
  try {
    await client.query(`
    UPDATE todos
    SET comment = ''
    WHERE todo_id = $1;
    `, [todoId]);
    
  } catch(ex) {
    console.log("error clearing note from todo in DB adapter");
    console.error(ex);
  }
}

const moveTodoToTail = async (todoId, listId) => {
  console.log(listId)
  try {
    const {rows: [todo]} = await client.query(`
      SELECT * from todos
      WHERE todo_id = $1;
    `, [todoId]);
    
    // set prev todo's next to cur todo's next todo id
    await client.query(`
      UPDATE todos SET next_id = $1 WHERE todo_id = $2;
    `, [todo.next_id, todo.prev_id])

    await client.query(`
      UPDATE todos SET prev_id = $2 WHERE todo_id = $1;
    `, [todo.next_id, todo.prev_id])

    // get tail todo ID
    const {rows: [tail]} = await client.query(`
      SELECT todo_id from todos WHERE prev_id IS NULL AND list_id = $1;  
    `, [listId])

    // set nexst_id to tail id
    await client.query(`
      UPDATE todos SET next_id = $1 WHERE todo_id = $2;  
    `, [tail.todo_id, todo.todo_id])
    
    // set prev_id to null 
    await client.query(`
      UPDATE todos SET prev_id = NULL WHERE todo_id = $1;  
    `, [todo.todo_id])

    // set tail's prev to moved item
    await client.query(`
      UPDATE todos SET prev_id = $1 WHERE todo_id = $2;  
    `, [todoId, tail.todo_id])

    } catch(ex) {
    console.log("error moving todo to tail of list in DB adapter");
    console.error(ex);
  }
}

module.exports = {
  getAllTodos,
  createTodo,
  getTodosByUserId,
  removeTodo,
  getTodoByTodoId,
  updateTodo,
  attachTodoNote,
  clearTodoNote,
  moveTodoToTail
}

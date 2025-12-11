const {Router} = require('express');
const listRouter = Router();

const {
  getListsByUserId,
  getTodosByUserId,
  createTodo,
  createList,
  deleteList,
  editListName
} = require('../db')

const {requireUser} = require('./utils');


listRouter.get('/', requireUser, async (req, res, next) => {
  try {
    const {user} = req;
    const lists = await getListsByUserId(user.user_id);
    const todos = await getTodosByUserId(user.user_id);

    lists.forEach((list) => {
      todos.forEach(todo => {
        if (todo.list_id === list.list_id) {
          if (list.todos) {
            list.todos.push(todo)
          } else {
            list.todos = [todo]
          }
        }
      })
      if (!list.todos) list.todos = [];
    })
    

    res.send({
      message: "successfully fetched todo lists",
      data: lists,
      error: false
    })
  } catch(ex) {
    console.log('error in GET lists handler');
    next({
      message: 'There was an error finding your lists!',
      error: true,
      errorData: ex
    });
  }
})

listRouter.post('/', requireUser, async (req, res, next) => {
  try {
    const {title} = req.body;
    const {user} = req;
    console.log(user)
    const list = await createList({title, ownerID: user.user_id});
    
    res.send({
      message: "successfully created todo list",
      data: list,
      error: false,
    });
  } catch(ex) {
    console.log("error creating a todolist in list router");
    next({
      message: "error creating a todolist in list router",
      error: ex,
    });
  }
})

listRouter.post('/:listId', requireUser, async (req, res, next) => {
  try {
    const {listId} = req.params;
    const {user} = req;
    const {todo} = req.body;
    
    const newTodo = await createTodo({title: todo, comment: '', creatorId: user.user_id, listId})
    
    res.send({
      data: newTodo,
      error: false,
      message: 'successfully added a new todo to a list!'
    });
    
  } catch(ex) {
    console.log('error posting a todo to a list in list router')
    next({
      message: 'error posting a todo to a list in list router',
      error: ex
    })
  }
})

listRouter.delete('/:listId', requireUser, async (req, res, next) => {
  try {
    const {listId} = req.params;
    const {user} = req;
    
    await deleteList({listId, userId: user.user_id});
    
    res.send({
      message: 'success deleting todo!'
    })
    
  } catch(ex) {
    console.log("error deleting list in list router");
    next({
      message: "error deleting list in list router",
      error: ex,
    });
  }
})

listRouter.put('/:listId', requireUser, async (req, res, next) => {
  try {
    const {listId} = req.params;
    const {user} = req;
    const {listName} = req.body;
    
    const updatedList = await editListName({listName, listId, userId: user.user_id});
    
    res.send({
      data: updatedList,
      error: false,
      message: "successfully updated list name!",
    });
    
  } catch(ex) {
    console.log("error updating list title in list router");
    next({
      message: "error updating list title in list router",
      error: ex,
    });
  }
})

module.exports = listRouter;

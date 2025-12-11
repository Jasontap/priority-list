import React, {useState, useEffect, createContext} from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { Button } from '@mui/material'
import './App.css';
import {
  fetchUsersTodoLists,
  fetchAllUsersTodos
} from './http-methods';

import {
  Login,
  Lists,
  Todos,
  WelcomePage,
  AddListForm
} from './components';

import {
  TokenContext,
  UsersTodoLists
} from './Context';

import {
  mainTheme
} from './muiThemes';


function NoPage() {
  return (
    <Link to={"/"}>Click to go Home</Link>
  )
}


function App() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [todoLists, setTodoLists] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [todosToDisplay, setTodosToDisplay] = useState([]);
  const [addList, setAddList] = useState(false);
  
  const navigate = useNavigate();
  
  function localTokenCheck() {
    const storedToken = window.localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
    } 
  }
  
  function logOut() {
    setToken('');
    window.localStorage.setItem('token', '');
    navigate('/');
  }
  
  async function getUsersTodoLists() {
    const todoFetchResults = await fetchUsersTodoLists(token);
    console.log(todoFetchResults)
    todoFetchResults.error ? logOut() : setTodoLists(todoFetchResults.data);
    const todos = await fetchAllUsersTodos(token);
    setAllTodos(todos.data);
  }

  useEffect(() => {
    localTokenCheck();
  }, []);
  
  useEffect(() => {
    if (token) {
      getUsersTodoLists();
    }
  }, [token]);
  
  return (
    <ThemeProvider theme={mainTheme}>
      <div id="app">
        {!token && (
          <Routes>
            <Route exact path="/" element={<WelcomePage navigate={navigate} />} />
            <Route
              exact
              path="/login"
              element={<Login setToken={setToken} navigate={navigate} />}
            />
            <Route
              exact
              path="/signup"
              element={
                <Login setToken={setToken} navigate={navigate} signUp={true} />
              }
            />
            <Route path="*" element={<NoPage />} />
          </Routes>
        )}

        {token && (
          <UsersTodoLists.Provider value={todoLists}>
            <TokenContext.Provider value={token}>
              <Button variant="contained" color="ochre" onClick={() => logOut()}>
                Log Out
              </Button>
              <Routes>
                <Route
                  exact
                  path="/lists"
                  element={
                    <Lists
                      todoLists={todoLists}
                      setTodosToDisplay={setTodosToDisplay}
                    />
                  }
                />
                <Route
                  exact
                  path="/lists/:listId"
                  element={
                    <Todos
                      todosToDisplay={todosToDisplay}
                      navigate={navigate}
                      getUsersTodoLists={getUsersTodoLists}
                      setTodosToDisplay={setTodosToDisplay}
                      todoLists={todoLists}
                    />
                  }
                />
              </Routes>
              {addList && (
                <AddListForm
                  token={token}
                  setAddList={setAddList}
                  getUsersTodoLists={getUsersTodoLists}
                />
              )}
              <Button variant="contained" color="ochre" onClick={() => setAddList(!addList)}>Add New List</Button>
            </TokenContext.Provider>
          </UsersTodoLists.Provider>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;

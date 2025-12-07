import React, { useState } from "react";
import {loginUser, registerUser} from '../http-methods';
import { Button, TextField } from "@mui/material";

function Login({setToken, navigate, signUp=false}) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pwConfirm, setPWConfirm] = useState('');
  const [error, setError] = useState('');
  
  async function login(e) {
    e.preventDefault();
    const response = await loginUser({username, password});

    if (response.error) {
      setError(response.message);
    } else {
      setToken(response.data);
      window.localStorage.setItem('token', response.data);
      navigate('/lists')
    }
  }
  
  async function signUpUser(e) {
    e.preventDefault();
    if (password === pwConfirm) {
      // if (password.length >= 8) {
        const response = await registerUser({username, email, password});
        
        if (response.error) {
          setError(response.message);
        } else {
          setToken(response.data);
          window.localStorage.setItem("token", response.data);
          navigate("/lists");
        }
      // } else {
      //   setError('Passord is not long enough.');
      // }
    } else {
      setError('Passwords do not match.');
    }
  }
  
  return (
    <form id="login-form" onSubmit={signUp ? signUpUser : login}>
      {signUp && (
        <TextField
          required
          type="email"
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          label="Enter Email"
          variant="outlined"
        />
      )}
      <TextField
        required={signUp}
        autoFocus={!signUp}
        onChange={(e) => setUsername(e.target.value)}
        label="Enter Username"
        variant="outlined"
      />
      <TextField
        type="password"
        required={signUp}
        onChange={(e) => setPassword(e.target.value)}
        label="Enter Password"
        variant="outlined"
      />
      {signUp ? (
        <>
          <TextField
            type="password"
            required
            onChange={(e) => setPWConfirm(e.target.value)}
            label="confirm password"
            variant="outlined"
          />
          <Button variant="contained" color="ochre" type="submit">signUp</Button>
        </>
      ) : (
        <Button variant="contained" color="ochre" type="submit">login</Button>
      )}
      <Button variant="contained" color="ochre" onClick={() => navigate('/')}>Go Back</Button>
      {error && <div>{error}</div>}
    </form>
  );
}

export default Login;

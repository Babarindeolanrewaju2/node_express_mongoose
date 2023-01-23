import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
});

const firestore = firebase.firestore();
const auth = firebase.auth();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');

const handleSignUp = async () => {
  try {
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    if (!user) {
      setError('Could not create user');
      return;
    }

    // Create a new user document in Firestore
    await firestore.collection('users').doc(user.uid).set({
      email: email,
    });

    setEmail('');
    setPassword('');
    setError('');
    console.log('Successfully signed up!');
  } catch (error) {
    console.error(error);
    setError(error.message);
  }
};

const handleLogin = async () => {
  try {
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    if (!user) {
      setError('Could not login user');
      return;
    }

    // Get the user data from Firestore
    const userData = await firestore.collection('users').doc(user.uid).get();

    setEmail('');
    setPassword('');
    setError('');
    console.log('Successfully logged in!', userData.data());
  } catch (error) {
    console.error(error);
    setError(error.message);
  }
};

const validateEmail = (email) => {
  // Use a regular expression to validate the email format
  const re =
    /^(([^<>()[]\.,;:\s@"]+(.[^<>()[]\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // Check that the password is at least 8 characters long
  return password.length >= 8;
};

return (
  <div>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    {error && <p>{error}</p>}
    <button onClick={handleSignUp}>Sign Up</button>
    <button onClick={handleLogin}>Login</button>
  </div>
);

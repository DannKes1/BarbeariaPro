import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5069/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

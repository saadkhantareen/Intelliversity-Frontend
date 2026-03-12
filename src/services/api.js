import axios from 'axios'

// Frontend: student.nust.localhost:5173
// Backend:  student.nust.localhost:8000
const backendURL = `${window.location.protocol}//${window.location.hostname}:8000`

const api = axios.create({
  baseURL: backendURL,
})

export default api
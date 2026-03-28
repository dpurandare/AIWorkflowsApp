import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 320_000, // 320 s — slightly longer than backend's 300 s n8n timeout
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token')
      localStorage.removeItem('token')
      // Append ?expired=1 so the login page can show a "session expired" message
      window.location.href = hadToken ? '/login?expired=1' : '/login'
    }
    return Promise.reject(error)
  },
)

export default client

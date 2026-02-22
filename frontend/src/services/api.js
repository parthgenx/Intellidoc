import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const uploadDocument = async (file, userId) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)
  
  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export default api
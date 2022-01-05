import request from '@/utils/request/index'

export default {
  login(data) {
    return request.post('/login', data)
  }
}

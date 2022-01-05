import request from '@/utils/request/index'

export default {
  getHomeList(data) {
    return request.get('/home', data)
  }
}

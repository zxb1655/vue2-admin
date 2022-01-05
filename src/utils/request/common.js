const $noify = require('element-ui').Notification
import store from '@/store'
import router from '@/router'
import { getType } from '@/utils'

/**
 * 拦截请求
 */
function interceptRequest(axiosInstance) {
  axiosInstance.interceptors.request.use(
    config => {
      const token = store.state.user.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // 没有token
        if (RouteWhiteList.every(path => config.url.indexOf(path) === -1)) {
          // 而且不是免token接口
          Dialog.alert({
            message: '请先登录噢'
          })
        }
      }
      return config
    },
    error => {
      $noify({
        type: 'error',
        message: '请求失败，请检查网络'
      })
      return Promise.reject(error)
    }
  )
}

/**
 * 响应-错误处理
 */
function interceptResponse(axios) {
  axios.interceptors.response.use(async response => {
    const body = response.data
    const bodyType = getType(body)
    if (bodyType === 'Object') {
      const { code, msg, payload } = body
      if (code !== 0) {
        $noify({
          type: 'error',
          message: msg || '服务器错误'
        })
      }
      return payload
    } else {
      return new Blob([body])
    }
  }, getResponseInterceptor())
}

function getResponseInterceptor() {
  return async error => {
    const { data, status } = error.response
    const dataType = getType(data)
    let body = data
    if (dataType === 'String') {
      body = JSON.parse(data)
    }
    const { msg } = body
    // console.log('getResponseInterceptor...', status)
    // 判断状态码
    if (body.code == -1) {
      store.dispatch('user/logout')
      router.replace({ path: '/login' })
    }
    switch (status) {
      case 401:
        $noify({
          type: 'error',
          message: '请先登录噢～'
        })
        break
      case 403:
        $noify({
          type: 'error'
        })
        store.dispatch('user/logout')
        router.replace({ path: '/login' })
        break
      case 500:
        $noify({
          type: 'error',
          message: msg || `请求失败（${status}）`
        })
        break
      default:
        $noify({
          type: 'error',
          message: `未知错误（${status}）`
        })
        break
    }
    return Promise.reject(new Error(msg))
  }
}

/**
 * 输出统一接口
 */
function getInterface(axiosInstance) {
  return {
    get(url, query) {
      return axiosInstance.get(url, {
        params: query
      })
    },
    getBlob(url, query) {
      return axiosInstance.get(url, {
        params: query,
        responseType: 'blob'
      })
    },
    post: axiosInstance.post.bind(axiosInstance),
    put: axiosInstance.put.bind(axiosInstance),
    patch: axiosInstance.patch.bind(axiosInstance),
    delete: axiosInstance.delete.bind(axiosInstance)
  }
}

export { interceptRequest, interceptResponse, getInterface }

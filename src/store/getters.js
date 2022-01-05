const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.info.avatar,
  name: state => state.user.info.name
}
export default getters

import { USER_LOGIN, USER_LOGOUT } from '../actions/MenuActions'

const DEFAULT_LOGIN_STATE = {
  isLogin: false
}

export default (state = DEFAULT_LOGIN_STATE, action: { type: String }) => {
  switch (action.type) {
    case USER_LOGIN:
      console.log('login is true');
      return { is_login: true }
    case USER_LOGOUT:
      console.log('login is false');
      return { is_login: false }
    default:
      return state
  }
}
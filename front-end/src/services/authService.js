/* eslint-disable */

import api from '@/services/api'

export default {
  registerUser (username, passwordHash, token) {
    return api().post('register', {
        username: username,
        passwordHash: passwordHash,
        token: token
    })
  },
  loginUser (username, password, token) {
    return api().post('login', {
      username: username,
      password: password,
      token: token
    })
  },
  firstRun () {
    return api().get('firstrun')
  }
}

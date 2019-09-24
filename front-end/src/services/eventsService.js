/* eslint-disable */

import api from '@/services/api'

export default {
  fetchEvents (username, token) {
    return api().post('events', {
      username: username,
      token: token
    })
  }
}

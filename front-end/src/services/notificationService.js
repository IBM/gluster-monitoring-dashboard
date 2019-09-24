import api from '@/services/api'

export default {
  getNotificationOptions () {
    return api().get('notification-options')
  },
  getNotificationRules (username, token) {
    return api().post('notification-rules', {
      username: username,
      token: token
    })
  },
  updateNotificationRules (notification_settings, username, token) {
    return api().post('notification', {
        notification_settings: notification_settings,
        username: username,
        token: token
    })
  },

}

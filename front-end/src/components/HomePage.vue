<template>
  <div class="homepage">
    <div v-if="isAuthenticated && !firstRun">
      <h1 id="header">Event Stream</h1>
      <div class="table">
        <div class="table-contents">
          <div class="filter-bar">
            <h4>Filters:</h4>
            <div class="filters-container">
              <div>
                <div class="single-filter">
                  <label class="filter-label" for="type-filter">Event Type:</label>
                  <select name="type-filter" id="type-filter" v-model="filters.eventType" @change="filterResults()">
                    <option value=""></option>
                    <option v-for="type in eventTypesPresent" v-bind:key="type" v-bind:value="type">{{ type }}</option>
                  </select>
                </div>
                <div class="single-filter">
                  <label class="filter-label" for="timeframe-filter">Timeframe:</label>
                  <select name="timeframe-filter" id="timeframe-filter" v-model="filters.timeframe" @change="filterResults()">
                    <option value=""></option>
                    <option v-for="timeframe in timeframes" v-bind:key="timeframe" v-bind:value="timeframe">{{ timeframe }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="events-table">
            <div class="table-header">
              <h4>Event Type</h4>
              <h4>Message</h4>
              <h4>Timestamp</h4>
            </div>
            <div class="table-body-container" v-bind:style="{ height: tableHeight + 'px' }">
              <div class="table-body-scrollable">
                <div v-for="event in filteredEvents" v-bind:key="event._id">
                  <div class="table-row">
                    <b class="table-row-item">{{ event.event }}</b>
                    <p class="table-row-item">{{ event.message }}</p>
                    <p class="table-row-item">{{ getReadableDate(event.created_at) }}</p>
                  </div>
                  <hr class="table-row-divider">
                </div>
              </div>
            </div>
          </div>
          <div class="notification-settings">
            <div class="notifications-settings-contents">
              <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" v-on:click="notificationModalActive = true">
                <i class="fas fa-cog"></i>
              </button>
              <h4 class="notifications-settings-label">Notification Settings</h4>
            </div>
            <div class="modal" v-bind:class="{ 'is-active': notificationModalActive }">
              <div class="modal-background" v-on:click="notificationModalActive = false"></div>
              <div class="modal-content">
                <div class="modal-body column is-three-quarters">
                  <h3 class="modal-header">Notification Settings</h3>
                  <button class="button" v-on:click="updateNotificationRules()">Save Rules</button>
                  <div class="rules">
                    <div class="rule-container" v-for="(rule, ruleindex) in notificationRules" v-bind:key="ruleindex">
                      <h4 class="modal-header">{{ rule.name }}</h4>
                      <div class="rule-sub-container">
                        <div class="rule-events-container column">
                          <div class="rule-events">
                            <div class="rule-event-container" v-for="(event, eventindex) in allEventTypes" v-bind:key="eventindex">
                              <input class="rule-event-checkbox" type="checkbox" v-bind:value="event" v-model="rule.events">
                              <label>{{ event }}</label>
                            </div>
                          </div>
                        </div>
                        <div class="column">
                          <div class="rule-setting column" v-for="(value, setting) in rule.settings" v-bind:key="setting">
                            <label class="column is-one-third">{{ camelCaseToReadable(setting) }}:</label>
                            <input class="column is-large" type="text" v-model="rule.settings[setting]">
                          </div>
                        </div>
                      </div>
                      <button class="delete-rule button" v-on:click="deleteNotificationRule(rule)">Delete Rule</button>
                    </div>
                    <div class="dropdown" v-bind:class="{ 'is-active': notificationDropdownActive }">
                      <div class="dropdown-trigger">
                        <button class="button" v-on:click="notificationDropdownActive = !notificationDropdownActive"><i class="fas fa-plus-circle" style="margin-right: 7px;"></i>Add Rule</button>
                      </div>
                      <div class="dropdown-menu">
                        <div class="dropdown-content">
                          <div class="dropdown-item" v-for="option in notificationOptions" v-bind:key="option.name">
                            <button class="button" v-on:click="addNotificationRule(option)">{{ option.name }}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button class="modal-close is-large" v-on:click="notificationModalActive = false"></button>
            </div>
          </div>
        </div> 
      </div> 
    </div>
    <div v-if="firstRun">
      <div class="columns is-desktop is-mobile">
        <div class="column is-3-desktop is-2-mobile"></div>
        <div class="column is-6-desktop is-8-mobile">
          <h3 class="title has-text-grey">Registration</h3>
          <p class="subtitle has-text-grey">Please Register to proceed</p>
          <div class="box">
            <figure class="avatar">
              <img width="128" height="128" src="https://www.gluster.org/wp-content/uploads/2016/03/gluster-ant.png">
            </figure>
            <form>
              <div class="field">
                <div class="control">
                  <input v-model="username" class="input is-small" type="username" placeholder="Username" autofocus="">
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <input v-model="password" class="input is-small" type="password" placeholder="Password">
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <input v-model="confirmpassword" class="input is-small" type="password" placeholder="Confirm Password">
                </div>
              </div>
              <button class="button is-block is-info is-large is-fullwidth" v-on:click="register(username, password, confirmpassword)">Register</button>
            </form>
          </div>
          <p class="has-text-grey">
            <a href="https://github.com/ibm/gluster-dashboard/">Need Help?</a>
          </p>
        </div>
        <div class="column is-3-desktop is-2-mobile"></div>
      </div>
    </div>
    <div v-if="!firstRun && !isAuthenticated">
      <div class="columns is-desktop is-mobile">
        <div class="column is-3-desktop is-2-mobile"></div>
        <div class="column is-6-desktop is-8-mobile">
          <h3 class="title has-text-grey">Login</h3>
          <p class="subtitle has-text-grey">Please Login to proceed</p>
          <div class="box">
            <figure class="avatar">
              <img width="128" height="128" src="https://www.gluster.org/wp-content/uploads/2016/03/gluster-ant.png">
            </figure>
            <form>
              <div class="field">
                <div class="control">
                  <input v-model="username" class="input is-small" type="username" placeholder="Username" autofocus="">
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <input v-model="password" class="input is-small" type="password" placeholder="Password">
                </div>
              </div>
              <button class="button is-block is-info is-large is-fullwidth" v-on:click="login(username, password)">Login</button>
            </form>
          </div>
          <p class="has-text-grey">
            <a href="https://github.com/ibm/gluster-dashboard/">Need Help?</a>
          </p>
        </div>
        <div class="column is-3-desktop is-2-mobile"></div>
      </div>
    </div>
  </div>
</template>

<script>
// import filters from './Filters.vue'
import eventsService from '@/services/eventsService'
import authService from '@/services/authService'
import notificationService from '@/services/notificationService'
export default {
  name: 'homepage',
  data () {
    return {
      events: [],
      filteredEvents: [],
      filters: {
        eventType: '',
        timeframe: ''
      },
      eventTypesPresent: [],
      allEventTypes: [
        "AFR_QUORUM_FAIL",
        "AFR_QUORUM_MET",
        "AFR_SPLIT_BRAIN",
        "AFR_SUBVOL_UP",
        "AFR_SUBVOLS_DOWN",
        "BITROT_BAD_FILE",
        "BITROT_DISABLE",
        "BITROT_ENABLE",
        "BITROT_SCRUB_FREQ",
        "BITROT_SCRUB_OPTION",
        "BITROT_SCRUB_THROTTLE",
        "BRICKPATH_RESOLVE_FAILED",
        "BRICKS_START_FAILED",
        "BRICK_CONNECTED",
        "BRICK_DISCONNECTED",
        "BRICK_REPLACE",
        "BRICK_RESET_COMMIT",
        "BRICK_RESET_START",
        "BRICK_START_FAILED",
        "BRICK_STOP_FAILED",
        "CLIENT_AUTH_REJECT",
        "CLIENT_CONNECT",
        "CLIENT_DISCONNECT",
        "COMPARE_FRIEND_VOLUME_FAILED",
        "EC_MIN_BRICKS_NOT_UP",
        "EC_MIN_BRICKS_UP",
        "GEOREP_FAULTY",
        "GEOREP_CONFIG_RESET",
        "GEOREP_CONFIG_SET",
        "GEOREP_CREATE",
        "GEOREP_DELETE",
        "GEOREP_PAUSE",
        "GEOREP_RESUME",
        "GEOREP_START",
        "GEOREP_STOP",
        "IMPORT_BRICK_FAILED",
        "IMPORT_QUOTA_CONF_FAILED",
        "IMPORT_VOLUME_FAILED",
        "NOTIFY_UNKNOWN_OP",
        "PEER_CONNECT",
        "PEER_DISCONNECT",
        "PEER_NOT_FOUND",
        "PEER_REJECT",
        "PEER_RPC_CREATE_FAILED",
        "PEER_STORE_FAILURE",
        "PEER_ATTACH",
        "PEER_DETACH",
        "POSIX_ACL_NOT_SUPPORTED",
        "POSIX_ALREADY_PART_OF_VOLUME",
        "POSIX_BRICK_NOT_IN_VOLUME",
        "POSIX_BRICK_VERIFICATION_FAILED",
        "POSIX_HEALTH_CHECK_FAILED",
        "POSIX_SAME_GFID",
        "QUORUM_LOST",
        "QUORUM_REGAINED",
        "QUOTA_CROSSED_SOFT_LIMIT",
        "QUOTA_DEFAULT_SOFT_LIMIT",
        "QUOTA_HARD_TIMEOUT",
        "QUOTA_ALERT_TIME",
        "QUOTA_DISABLE",
        "QUOTA_ENABLE",
        "QUOTA_REMOVE_OBJECTS_LIMIT",
        "QUOTA_REMOVE_USAGE_LIMIT",
        "QUOTA_SET_OBJECTS_LIMIT",
        "QUOTA_SET_USAGE_LIMIT",
        "QUOTA_SOFT_TIMEOUT",
        "REBALANCE_START_FAILED",
        "REBALANCE_STATUS_UPDATE_FAILED",
        "SNAPSHOT_ACTIVATE_FAILED",
        "SNAPSHOT_ACTIVATED",
        "SNAPSHOT_CLONE_FAILED",
        "SNAPSHOT_CLONED",
        "SNAPSHOT_CONFIG_UPDATE_FAILED",
        "SNAPSHOT_CONFIG_UPDATED",
        "SNAPSHOT_CREATE_FAILED",
        "SNAPSHOT_CREATED",
        "SNAPSHOT_DEACTIVATE_FAILED",
        "SNAPSHOT_DEACTIVATED",
        "SNAPSHOT_DELETE_FAILED",
        "SNAPSHOT_DELETED",
        "SNAPSHOT_HARD_LIMIT_REACHED",
        "SNAPSHOT_RESTORE_FAILED",
        "SNAPSHOT_RESTORED",
        "SNAPSHOT_SCHEDULER_DISABLE_FAILED",
        "SNAPSHOT_SCHEDULER_DISABLED",
        "SNAPSHOT_SCHEDULER_ENABLE_FAILED",
        "SNAPSHOT_SCHEDULER_ENABLED",
        "SNAPSHOT_SCHEDULER_INIT_FAILED",
        "SNAPSHOT_SCHEDULER_INITIALISED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_ADD_FAILED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_ADDED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_DELETE_FAILED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_DELETED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_EDIT_FAILED",
        "SNAPSHOT_SCHEDULER_SCHEDULE_EDITED",
        "SNAPSHOT_SOFT_LIMIT_REACHED",
        "SVC_CONNECTED",
        "SVC_DISCONNECTED",
        "SVC_MANAGER_FAILED",
        "TIER_ATTACH",
        "TIER_ATTACH_FORCE",
        "TIER_DETACH_COMMIT",
        "TIER_DETACH_FORCE",
        "TIER_DETACH_START",
        "TIER_DETACH_STOP",
        "TIER_PAUSE",
        "TIER_RESUME",
        "TIER_WATERMARK_DROPPED_TO_LOW",
        "TIER_WATERMARK_DROPPED_TO_MID",
        "TIER_WATERMARK_HI",
        "TIER_WATERMARK_RAISED_TO_MID",
        "UNKNOWN_PEER",
        "VOLUME_ADD_BRICK",
        "VOLUME_CREATE",
        "VOLUME_DELETE",
        "VOLUME_REBALANCE_COMPLETE",
        "VOLUME_REBALANCE_FAILED",
        "VOLUME_REBALANCE_START",
        "VOLUME_REBALANCE_STOP",
        "VOLUME_REMOVE_BRICK_COMMIT",
        "VOLUME_REMOVE_BRICK_FORCE",
        "VOLUME_REMOVE_BRICK_START",
        "VOLUME_REMOVE_BRICK_STOP",
        "VOLUME_RESET",
        "VOLUME_SET",
        "VOLUME_START",
        "VOLUME_STOP",
      ],
      timeframes: [
        'past minute',
        'past 10 minutes',
        'past hour',
        'past day',
        'past week',
        'past month'
      ],
      notificationOptions: [],
      notificationRules: [],
      notificationModalActive: false,
      notificationDropdownActive: false,
      tableHeight: null,
      isAuthenticated: false,
      firstRun: false,
      username: '',
      password: '',
      confirmpassword: '',
      token: '',
    }
  },
  mounted () {
    this.getEvents()
    this.interval = setInterval(() => this.getEvents(), 100000)

    window.addEventListener('resize', this.handleResize)
    this.handleResize()

    this.firstRunCheck()
    if (this.$cookies.isKey('auth')) {
      var auth = this.$cookies.get('auth');
      this.tokenLogin(auth)
    }
    else {
      this.isAuthenticated = false
    }
  },
  methods: {
    async firstRunCheck () {
      try {
        const response = await authService.firstRun()
        this.firstRun = response.data.firstrun
        if(response.data.firstrun) {
          this.isAuthenticated = false
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getEvents () {
      if(this.isAuthenticated){
        try {
          var auth = this.$cookies.get('auth');
          const response = await eventsService.fetchEvents(auth.username, auth.token)
          this.events = response.data.events
          this.getEventTypes()
          this.filterResults()
        } catch (e) {
          console.error(e)
        }
      }
    },
    async tokenLogin (auth) {
      try {
        const response = await authService.loginUser(auth.username, null, auth.token)
        this.isAuthenticated = response.data.verified
        if (response.data.verified) {
          this.getNotificationOptions()
          this.getNotificationRules()
          this.getEvents()
        }
      } catch (e) {
        console.error(e)
      }
    },
    async login (username, password) {
      try {
        const response = await authService.loginUser(username, password)
        this.isAuthenticated = response.data.verified
        if (response.data.verified) {
          var date = new Date;
          date.setDate(date.getDate() + 1);
          var auth = {
            username: username,
            token: response.data.token
          }
          this.$cookies.set('auth', auth, date)
          this.isAuthenticated = true
          this.firstRun = false
          this.getNotificationOptions()
          this.getNotificationRules()
          this.getEvents()
        }
        else{
          console.log("Login Failed")
        }
      } catch (e) {
        console.error(e)
      }
    },
    async register (username, password, confirmpassword) {
      try {
        if(password == confirmpassword){
          var token = this.$jwt.sign({authorized: true}, window.REGISTRATION_SECRET)
          var passwordHash = this.$passwordHash.generate(password)
          const response = await authService.registerUser(username, passwordHash, token)
          if(response.data.success) {
            this.firstRun = false
            this.isAuthenticated = false
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getNotificationOptions () {
      try {
        const response = await notificationService.getNotificationOptions()
        this.notificationOptions = response.data.notification_options
      } catch (e) {
        console.error(e)
      }
    },
    async updateNotificationRules () {
      try {
        var auth = this.$cookies.get('auth');
        const response = await notificationService.updateNotificationRules(this.notificationRules, auth.username, auth.token)
        this.notificationRules = response.data.notification_rules
      } catch (e) {
        console.error(e)
      }
    },
    async getNotificationRules () {
      try {
        var auth = this.$cookies.get('auth');
        const response = await notificationService.getNotificationRules(auth.username, auth.token)
        this.notificationRules = response.data.notification_rules
      } catch (e) {
        console.error(e)
      }
    },
    async deleteNotificationRule (rule) {
      this.notificationRules = this.notificationRules.filter((existingRule) => existingRule !== rule)
      await updateNotificationRules()
    },
    addNotificationRule (base) {
      this.notificationDropdownActive = false
      var emptyRule = base
      emptyRule.events = []
      this.notificationRules.push(emptyRule)
    },
    getReadableDate (originalDate) {
      // get current date in a human-readable format
      originalDate = new Date(originalDate)
      const month = this.fixPartialDateFormat(originalDate.getMonth() + 1)
      const day = this.fixPartialDateFormat(originalDate.getDate())
      const hour = this.fixPartialDateFormat(originalDate.getHours())
      const minute = this.fixPartialDateFormat(originalDate.getMinutes())
      const second = this.fixPartialDateFormat(originalDate.getSeconds())
      return `${originalDate.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`
    },
    fixPartialDateFormat (initial) {
      // change single-digit values to have a zero first
      return initial < 10 ? `0${initial}` : initial
    },
    getEventTypes () {
      this.events.forEach((event) => {
        if (!this.eventTypesPresent.includes(event.event)) {
          this.eventTypesPresent.push(event.event)
        }
      })
    },
    filterResults () {
      const now = new Date()
      const cutoff = this.findCutoff(now)
      if (this.events.length > 0) {
        var filteredEvents = this.events.filter((event) => {
          var fit = { type: false, time: false }
          fit.time = new Date(event.created_at) > cutoff
          if (this.filters.eventType === '' || event.event === this.filters.eventType) {
            fit.type = true
          }
          return fit.type && fit.time
        })
        this.filteredEvents = filteredEvents
      } else {
        this.filteredEvents = []
      }
    },
    findCutoff (now) {
      switch (this.filters.timeframe) {
        case '':
          return new Date('2019-01-01 00:00:00')
        case 'past minute':
          return new Date(now - 60000)
        case 'past 10 minutes':
          return new Date(now - 600000)
        case 'past hour':
          return new Date(now - 3600000)
        case 'past day':
          return new Date(now - 86400000)
        case 'past week':
          return new Date(now - 604800000)
        case 'past month':
          return new Date(now - 2628000000)
      }
    },
    camelCaseToReadable (original) {
      const splitWords = original.split(/(?=[A-Z])/).join(" ")
      return `${splitWords[0].toUpperCase()}${splitWords.slice(1)}`
    },
    handleResize() {
      if (this.isAuthenticated && !this.firstRun) {
        const windowHeight = window.innerHeight
        const header = document.querySelector("#header")
        const appElement = document.querySelector("#app")
        var appElementMargin = document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(appElement).marginTop : appElement.currentStyle["margin-top"]
        appElementMargin = appElementMargin.slice(0, -2)
        const tableHeaderHeight = document.querySelector(".table-header").clientHeight
        this.tableHeight = windowHeight - (header.clientHeight + tableHeaderHeight + parseInt(appElementMargin)) - 25
      }
    }
  }
  // components: {
  //   filters
  // }
}
</script>


<!-- make general classes for flex+center & flex+space-between -->
<style scoped>

html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

#header {
  font-size: 1.5rem;
  padding-bottom: 1rem;
}

.table {
  display: flex;
  flex-direction: column;
  height: 90%;
}

.table-contents {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

.filter-bar, .notification-settings {
  width: 15%;
  min-width: 220px;
}

.filters-container {
  display: flex;
  justify-content: center;
}

.single-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
}

.events-table {
  width: 40%;
  min-width: 220px;
}

.table-header {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid;
  padding: 5px;
}

.table-body-container {
  overflow: hidden;
  position: relative;
  border-bottom: 1px solid #000;
}

.table-body-scrollable {
  height: 100%;
  overflow-y: scroll;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 25px;
}

.table-row-item {
  width: 33%;
}

.table-row-divider {
  width: 90%;
  margin: auto;
  border-top: 0px;
  border-right-color: #ccc;
  border-bottom-color: #ccc;
  border-left-color: #ccc;
}

.notifications-settings-contents {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-settings-label {
  margin-left: 10px;
  font-size: 1.25rem;

}

.modal-content {
  width: 100%;
  height: 75%;
  display: flex;
  justify-content: center;
}

.modal-body {
  background-color: #fff;
  overflow: scroll;
}

.modal-header {
  font-size: 1.25rem;
}

.rule-container {
  border: 1px solid #ccc;
  margin: 10px;
  padding: 10px;
}

.rule-sub-container {
  display: flex;
}

.modal-header {
  font-size: 1.25rem;
}

.rule-events-container {
  position: relative;
  overflow: hidden;
  padding: 1.5rem 0.75rem 0.75rem;
  margin-bottom: 1.75rem;
}

.rule-events {
  height: 100%;
  position: absolute;
  overflow-y: scroll;
  border: 1.2px solid #ccc;
}

.rule-event-container {
  display: flex;
  justify-content: left;
  align-items: center;
}

.rule-event-checkbox {
  margin-right: 10px;
}

.rule-setting {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rule-setting label {
  text-align: left;
  padding: 0 5px;
}

.rule-setting input {
  padding: 0.5rem
}

.delete-rule {
  color: rgb(141, 15, 15);
}

</style>

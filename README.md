# Gluster Monitoring-Dashboard
Infrastructure monitoring dashboard for Red Hat Gluster Storage (GlusterFS) network file system.

This project is separated into 3 parts: the backend, the frontend, and a helm chart to automatically install the dashboard to Kubernetes Cluster.

## Setup

- Backend
  - Setup a MongoDB instance (with authentication)
  - Set Environment variable `MONGODB_SERVICE` <- The hostname of your MongoDB instance (default 'localhost')
  - Set Environment variable `MONGODB_USER`
  - Set Environment variable `MONGODB_PASSWORD`
  - Set Environment variable `BEARER_SECRET` (default: 'glusterSecret')
  - set Environment variable `REGISTRATION_SECRET` (default: 'glusterSecret')
  - Deploy the backend file using `npm run start` or `node src/app.js`
- Frontend
  - Set Environment variable `BACKEND_HOSTNAME` (default: 'localhost')
  - Set Environment variable `REGISTRATION_SECRET` <- Same as the `REGISTRATION_SECRET` in the Backend
- GlusterCluster
  - Run `yum install -y glusterfs-api`
  - Run `yum install -y glusterfs-events`
  - Run `systemctl enable glustereventsd`
  - Run `systemctl start glustereventsd`
  - Check the status with `gluster-eventsapi status`
  - Add your backend with `gluster-eventsapi webhook-add --bearer_token BEARER_TOKEN BACKEND_HOSTNAME` <- BEARER_TOKEN will be generated and printed to the console the first time you run the backend, BACKEND_HOSTNAME is the hostname of your backend
  - For more documentation check here: https://docs.gluster.org/en/latest/Administrator%20Guide/Events%20APIs/
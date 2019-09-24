/* eslint-disable */

import axios from 'axios'

export default() => {
  const api = axios.create({
    baseURL: 'http://' + window.BACKEND_HOSTNAME.toString(),
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    credentials: 'same-origin',
    timeout: 50000
  })

  api.interceptors.request.use(config=>{
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    setTimeout(()=>source.cancel({message:'Timed out after 30s',config}), 30000);
    return config;
  });
  api.interceptors.response.use(null,error=>{
      if (!error.config && error.message && error.message.config){
          error.config = error.message.config;
      }
      throw error;
  });

  return api
}

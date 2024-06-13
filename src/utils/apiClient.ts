import axios from 'axios';

// UAPI
export const uapiClient = axios.create({
  baseURL: '/uapi',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ChmlFrp v1 API
export const v1Client = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ChmlFrp v2 API
export const v2Client = axios.create({
  baseURL: '/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // 通用请求方法
  sendRequestToUapi(method: string, url: string, data = null) {
    return uapiClient({
      method,
      url,
      data
    });
  },

  sendRequestToV1api(method: string, url: string, data = null) {
    return v1Client({
      method,
      url,
      data
    });
  },

  sendRequestToV2api(method: string, url: string, data = null) {
    return v2Client({
      method,
      url,
      data
    });
  },

  // 方便的 POST 请求方法
  postDataToUapi(data: null | undefined) {
    return this.sendRequestToUapi('post', '/endpoint', data);
  },

  postDataToV1api(data: null | undefined) {
    return this.sendRequestToV1api('post', '/endpoint', data);
  },

  postDataToV2api(data: null | undefined) {
    return this.sendRequestToV2api('post', '/endpoint', data);
  },

  // 方便的 GET 请求方法
  getDataFromUapi(url: string) {
    return this.sendRequestToUapi('get', url);
  },

  getDataFromV1api(url: string) {
    return this.sendRequestToV1api('get', url);
  },

  getDataFromV2api(url: string) {
    return this.sendRequestToV2api('get', url);
  },
};

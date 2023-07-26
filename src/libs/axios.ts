import axios, { AxiosError } from 'axios';

const makeRequest = async <T>(method: string, url: string, settings = {}) => {
  try {
    return (await axios<T>({ method, url, ...settings })).data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('error', error.status, error.response?.data);
    } else {
      console.log('error', error);
    }

    return null;
  }
}

export const makeGetRequest = <T>(url: string, queryParams = {}, settings = {}) =>
  makeRequest<T>('GET', url, { params: queryParams, ...settings });

export const makePostRequest = <T>(url: string, body = {}, settings = {}) =>
  makeRequest<T>('POST', url, { data: body, ...settings });

export const makePutRequest = <T>(url: string, body = {}, settings = {}) =>
  makeRequest<T>('PUT', url, { data: body, ...settings });

export const makeDeleteRequest = <T>(url: string, settings = {}) =>
  makeRequest<T>('DELETE', url, settings);

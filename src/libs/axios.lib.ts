import axios, { AxiosError } from 'axios';

export class AxiosLib {
  static makeGetRequest = <T>(url: string, queryParams = {}, settings = {}) =>
    AxiosLib.makeRequest<T>('GET', url, { params: queryParams, ...settings });

  static makePostRequest = <T>(url: string, body = {}, settings = {}) =>
    AxiosLib.makeRequest<T>('POST', url, { data: body, ...settings });

  static makePutRequest = <T>(url: string, body = {}, settings = {}) =>
    AxiosLib.makeRequest<T>('PUT', url, { data: body, ...settings });
  
  static makeDeleteRequest = <T>(url: string, body = {}, settings = {}) =>
    AxiosLib.makeRequest<T>('DELETE', url, { data: body, ...settings });

  private static makeRequest = async <T>(method: string, url: string, settings = {}) => {
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
}

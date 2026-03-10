import { HttpStatus } from '@nestjs/common';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import { AxiosApiInvocationResponse } from '../types/axios.type';

export const invokeAPI = async <TRequest = unknown, TResponse = unknown>(
  method: Method,
  url: string,
  data?: TRequest,
  headers?: Record<string, string>,
  params?: Record<string, unknown>,
): Promise<AxiosApiInvocationResponse<TResponse>> => {
  const reqConfigs: AxiosRequestConfig<TRequest> = {
    method,
    url,
    data,
    headers,
    params,
  };

  try {
    const response: AxiosResponse<TResponse> = await axios(reqConfigs);

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<TResponse>;

    return {
      statusCode:
        axiosError.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      data: axiosError.response?.data as TResponse,
    };
  }
};

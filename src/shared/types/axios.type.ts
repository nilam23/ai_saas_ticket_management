export type AxiosApiInvocationResponse<T = unknown> = {
  statusCode: number;
  data: T;
};

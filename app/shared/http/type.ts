export type TApiSuccess<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type TApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

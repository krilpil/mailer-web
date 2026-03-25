import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const controller = new AbortController();
const isServer = typeof window === 'undefined';

export const API: AxiosInstance = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: { indexes: null },
  signal: controller.signal,
  timeout: isServer ? 1500 : 0,
});

const logOnDev = (message: string) => {
  if (process.env.NODE_ENV !== 'production' || isServer)
    // eslint-disable-next-line no-console
    console.log(
      new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(new Date()),
      message
    );
};

const handlerRequest = async (config: InternalAxiosRequestConfig) => {
  const { method, url } = config;

  logOnDev(`🚀 [API] ${method?.toUpperCase()} ${url} | Request`);

  return { ...config };
};

const handlerResponse = async (response: AxiosResponse): Promise<AxiosResponse> => {
  const { status, config } = response;

  logOnDev(`🚀 [API] ${config.method?.toUpperCase()} ${config.url} | Response ${status}`);

  return response;
};

const handlerError = async (error: AxiosError | Error): Promise<AxiosError> => {
  if (axios.isAxiosError(error)) {
    const { message } = error;
    const { method, url } = error.config as AxiosRequestConfig;
    const { status } = (error.response as AxiosResponse) ?? {};

    logOnDev(`🚨 [API] ${method?.toUpperCase()} ${url} | Error ${status} ${message}`);
  }

  logOnDev(`${JSON.stringify(error)}`);

  return Promise.reject(error);
};

API.interceptors.request.use(handlerRequest, handlerError);
API.interceptors.response.use(handlerResponse, handlerError);

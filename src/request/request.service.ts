import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly instance = axios.create({
    timeout: 10000, // 默认超时时间
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor(private configService: ConfigService) {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        this.logger.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        
        // 可以在这里添加认证信息
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        
        return config;
      },
      (error) => {
        this.logger.error('请求错误', error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        this.logger.log(`请求成功: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          this.logger.error(
            `请求失败: ${error.config?.method?.toUpperCase()} ${error.config?.url} - 状态码: ${error.response.status}`,
            error.response.data,
          );
        } else if (error.request) {
          this.logger.error('请求超时或无响应', error.message);
        } else {
          this.logger.error('请求配置错误', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  // GET 请求
  async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      params.appkey = this.configService.get('TAO_KEY');
      params.sid = this.configService.get('TAO_SID');
      const config: AxiosRequestConfig = {
        params: {
          ...params,
          appkey: this.configService.get('TAO_KEY'),
          sid: this.configService.get('TAO_SID'),
        },
      } 
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 统一错误处理
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // 根据状态码处理不同错误
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 401:
            return new Error('未授权，请重新登录');
          case 403:
            return new Error('拒绝访问');
          case 404:
            return new Error('请求的资源不存在');
          case 500:
            return new Error('服务器错误');
          default:
            return new Error(`请求失败: ${axiosError.message}`);
        }
      } else if (axiosError.request) {
        return new Error('网络错误，请检查您的网络连接');
      }
    }
    
    return error instanceof Error ? error : new Error('未知错误');
  }
}
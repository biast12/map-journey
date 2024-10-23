import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface RequestData {
  makeRequest: (url: string, method?: string, headers?: Record<string, string> | undefined, data?: any) => Promise<void>;
  isLoading: boolean;
  data: any;
  error: boolean;
}

function useRequestData(): RequestData {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const makeRequest = async (url: string, method: string = "GET", headers: Record<string, string> | undefined = undefined, data: any = null): Promise<void> => {
    let response: AxiosResponse | undefined;
    setIsLoading(true);

    // Check if method is valid
    const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
    if (!validMethods.includes(method.toUpperCase())) {
      console.error(`Invalid method: ${method}`);
      setError(true);
      setIsLoading(false);
      return;
    }

    const options: AxiosRequestConfig = {
      url: url,
      method: method,
      headers: headers,
      data: data,
    };

    try {
      response = await axios.request(options);

      if (response && response.data !== undefined) {
        setData(response.data);
        setError(false);
      } else {
        setData(null);
        setError(true);
        throw new Error("Error: No data in response");
      }
    } catch (error) {
      setData(null);
      setError(true);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { makeRequest, isLoading, data, error };
}

export default useRequestData;
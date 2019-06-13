// import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import { UserConfig } from "../typings/api";

// export class ApiClient {
//   private _instance: AxiosInstance;
//   private _connected: boolean;

//   constructor(userConfig: UserConfig) {
//     this._connected = false;
//     this._instance = Axios.create({
//       baseURL: userConfig.apibaseurl,
//       timeout: 10000,
//       headers: {
//         Authorization: "Bearer " + userConfig.token,
//         "Content-Type": "application/json",
//         "User-Agent": "github.com/exercism/cli"
//       }
//     });
//   }

//   get connected(): boolean {
//     return this._connected;
//   }

//   async request(options: AxiosRequestConfig): Promise<AxiosResponse> {
//     return this._instance.request(options);
//   }

//   async ping(): Promise<void> {
//     try {
//       const { status } = await this.request({
//         method: "get",
//         url: "/ping"
//       });
//       status === 200 ? (this._connected = true) : (this._connected = false);
//     } catch (e) {
//       console.error(e);
//     }
//   }
// }

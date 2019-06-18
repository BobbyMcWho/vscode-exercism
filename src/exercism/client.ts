// import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import * as fs from "fs-extra";
// import { join } from "path";
// import { Logger } from "../common/logger";
// import { DownloadPayload, Exercise, Track, UserConfig } from "../typings/api";

// export class ExercismClient {
//   private _axiosInstance: AxiosInstance;
//   private _isConnected: boolean = false;

//   constructor(userConfig: UserConfig) {
//     this._axiosInstance = Axios.create({
//       baseURL: userConfig.apibaseurl,
//       timeout: 10000,
//       headers: {
//         Authorization: "Bearer " + userConfig.token,
//         "Content-Type": "application/json",
//         "User-Agent": "github.com/exercism/cli"
//       }
//     });
//   }

//   get isConnected(): boolean {
//     return this._isConnected;
//   }

//   async request<T>(options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
//     return this._axiosInstance.request<T>(options);
//   }

//   async ping(): Promise<void> {
//     try {
//       const { status } = await this.request({
//         method: "get",
//         url: "/ping"
//       });
//       this._isConnected = status === 200 ? true : false;
//     } catch (e) {
//       Logger.error("client", e);
//     }
//   }
// }

// export class ExercismClientController {
//   private _client: ExercismClient;

//   constructor(private _userConfig: UserConfig) {
//     this._client = new ExercismClient(this._userConfig);
//   }

//   async downloadExerciseFiles(track: Track, exercise: Exercise): Promise<void> {
//     const exerciseDir = join(this._userConfig.workspace, track.id, exercise.id);

//     // Send a GET request to the api to fetch the solution data
//     const solutionDataResp = await this._client.request<DownloadPayload>({
//       method: "GET",
//       url: `/solutions/latest?exercise_id=${exercise.id}&track_id=${track.id}`
//     });

//     const payload = solutionDataResp.data;

//     // Write the metadata contents
//     await this.writeMetaDataFile(exerciseDir, payload);

//     for (const filename of payload.solution.files) {
//       // Send a GET request to the api to fetch the file data
//       const fileDataResp = await this._client.request<any>({
//         method: "GET",
//         baseURL: payload.solution.file_download_base_url,
//         url: `/${filename}`
//       });

//       // Don't bother with empty files.
//       if (fileDataResp.headers["Content-Length"] === 0) {
//         continue;
//       }

//       // Create the exercise file
//       await fs.outputFile(join(exerciseDir, filename), fileDataResp.data);
//     }
//   }

//   async writeMetaDataFile(exerciseDir: string, payload: DownloadPayload): Promise<void> {
//     return fs.outputFile(
//       join(exerciseDir, ".exercism", "metadata.json"),
//       JSON.stringify({
//         track: payload.solution.exercise.track.id,
//         exercise: payload.solution.exercise.id,
//         id: payload.solution.id,
//         url: payload.solution.url,
//         handle: payload.solution.user.handle,
//         is_requester: payload.solution.user.is_requester,
//         auto_approve: payload.solution.exercise.auto_approve
//       })
//     );
//   }
// }

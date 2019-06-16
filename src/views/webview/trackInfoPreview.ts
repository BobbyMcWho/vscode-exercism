
// export class TrackInfoPreview extends DisposableStore implements TreeNodePreview {
//   public title: string;
//   public iconPath: CustomIconURI;
//   public message: WebviewMessage;

//   private readonly _onDidUpdateMessage = new vscode.EventEmitter<WebviewMessage>();
//   public readonly onDidUpdateMessage = this._onDidUpdateMessage.event;

//   constructor(
//     private _trackNode: TrackNode,
//     private _exercismController: ExercismController,
//     private _tracksTreeProvider: TracksTreeProvider
//   ) {
//     super();

//     const track = this._trackNode.track;

//     this.iconPath = this._exercismController.getTrackIconPath(track);
//     this.title = track.name;
//     this.message = {
//       view: "track",
//       command: "update:all",
//       payload: {
//         track: track,
//         trackIconPath: this.iconPath.light.with({ scheme: "vscode-resource" }).toString()
//       }
//     };

//     this.subscribe(
//       this._tracksTreeProvider.onDidChangeTreeData(node => {
//         if (node instanceof TrackNode && node.id === this._trackNode.id) {
//           this._onDidUpdateMessage.fire({
//             view: "track",
//             command: "update",
//             payload: {
//               track
//             }
//           });
//         }
//       })
//     );
//   }
// }

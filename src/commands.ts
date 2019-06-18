import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";
import { ExtensionManager } from "./common/context";
import { ExercismController } from "./exercism/controller";
import { ExerciseStatus } from "./typings/api";
import { ExerciseFilter, NodeFilterProvider, TrackFilter } from "./views/tree/nodeFilterProvider";
import { ExerciseNode } from "./views/tree/nodes/exerciseNode";
import { FileNode, getFileNodeExerciseNode } from "./views/tree/nodes/fileNode";
import { TrackNode } from "./views/tree/nodes/trackNode";
import { TracksTreeProvider } from "./views/tree/tracksTreeProvider";
import { ExerciseInfoPreview } from "./views/webview/exerciseInfoPreview";
import { TreeNodePreviewManager } from "./views/webview/previewManager";

interface ICommand {
  id: string;
  cb: (...args: any[]) => void | Promise<void>;
}

export function RegisterAllCommands(
  exercismController: ExercismController,
  tracksTreeProvider: TracksTreeProvider,
  nodeFilterProvider: NodeFilterProvider
): void {
  [
    {
      id: "exercism.track.toggleFocus",
      cb: (trackNode: TrackNode): void => {
        nodeFilterProvider.toggleTrackFocus(trackNode);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.track.openAsFolder",
      cb: (trackNode: TrackNode): void => {
        const dir = exercismController.getTrackDirPath(trackNode.track);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(dir));
      }
    },
    {
      id: "exercism.track.downloadAllExercises",
      cb: async (trackNode: TrackNode): Promise<void> => {
        let disposables: vscode.Disposable[] = [];
        await vscode.window.withProgress(
          {
            title: "Downloading exercise:",
            cancellable: true,
            location: vscode.ProgressLocation.Notification
          },
          async (progress, token) => {
            token.onCancellationRequested(
              () => {
                throw new Error("Cancelled downloading all exercises.");
              },
              null,
              disposables
            );

            const exerciseNodes = await trackNode.getChildren();

            for (let i = 0; i < exerciseNodes.length; i++) {
              const exerciseNode = exerciseNodes[i];
              progress.report({ message: exerciseNode.id, increment: (i / exerciseNodes.length) * 100 });

              if (!(exerciseNode.exercise.status & ExerciseStatus.DOWNLOADED)) {
                while (true) {
                  try {
                    await exercismController.downloadExercise(trackNode.track, exerciseNode.exercise);
                  } catch (e) {
                    const action = await vscode.window.showErrorMessage(String(e), "Retry", "Cancel");
                    if (action !== "Retry") {
                      return;
                    }
                  }
                  tracksTreeProvider.refresh(exerciseNode);
                }
              }
            }
          }
        );
        disposables.forEach(d => d.dispose());
      }
    },
    {
      id: "exercism.exercise.createNewFile",
      cb: async (exerciseNode: ExerciseNode): Promise<void> => {
        const newFileName = await vscode.window.showInputBox({
          placeHolder: "New file name",
          prompt: "Input the name of the file you wish to create."
        });
        if (newFileName) {
          const dirPath = exercismController.getExerciseDirPath(exerciseNode.parent.track, exerciseNode.exercise);
          fs.writeFile(path.join(dirPath, newFileName), "", () => tracksTreeProvider.refresh(exerciseNode));
        }
      }
    },
    {
      id: "exercism.exercise.complete",
      cb: (exerciseNode: ExerciseNode): void => {
        if (!(exerciseNode.exercise.status & ExerciseStatus.COMPLETED)) {
          exercismController.completeExercise(exerciseNode.parent.track, exerciseNode.exercise);
          tracksTreeProvider.refresh(exerciseNode.parent);
          tracksTreeProvider.refresh(exerciseNode);
        }
      }
    },
    {
      id: "exercism.exercise.download",
      cb: async (exerciseNode: ExerciseNode): Promise<void> => {
        if (!(exerciseNode.exercise.status & ExerciseStatus.DOWNLOADED)) {
          try {
            await vscode.window.withProgress(
              {
                title: "Downloading exercise: " + exerciseNode.id,
                location: vscode.ProgressLocation.Notification
              },
              () => exercismController.downloadExercise(exerciseNode.parent.track, exerciseNode.exercise)
            );
          } catch (e) {
            const action = await vscode.window.showErrorMessage(String(e), "Retry", "Cancel");
            if (action === "Retry") {
              return vscode.commands.executeCommand("exercism.exercise.download", exerciseNode);
            } else {
              return;
            }
          }
          tracksTreeProvider.refresh(exerciseNode);
          tracksTreeProvider.view.reveal(exerciseNode, { expand: true });
        } else {
          vscode.window.showErrorMessage("You have already downloaded this exercise.");
        }
      }
    },
    {
      id: "exercism.exercise.preview",
      cb: (exerciseNode: ExerciseNode): void => {
        TreeNodePreviewManager.createOrUpdate(
          new ExerciseInfoPreview(exerciseNode, exercismController, tracksTreeProvider)
        );
      }
    },
    {
      id: "exercism.exercise.openStart",
      cb: async (exerciseNode: ExerciseNode): Promise<void> => {
        if (!(exerciseNode.exercise.status & ExerciseStatus.DOWNLOADED)) {
          const action = await vscode.window.showErrorMessage(
            `You can only open an exercise after it has been downloaded. Would you like to download "${exerciseNode.id}"?`,
            "Download",
            "Cancel"
          );

          if (action !== "Download") {
            return;
          }

          try {
            await vscode.commands.executeCommand("exercism.exercise.download", exerciseNode);
          } catch {
            return;
          }
        }

        const fileNodes = await exerciseNode.getChildren();
        vscode.commands.executeCommand("vscode.setEditorLayout", {
          orientation: 0,
          groups: [{ groups: [], size: 0.5 }, { groups: [{}, {}], size: 0.5 }]
        });

        fileNodes.forEach((fileNode, i) => {
          vscode.window.showTextDocument(fileNode.resourceUri, {
            preview: false,
            viewColumn: i === 0 ? 2 : i === 2 ? 3 : i
          });
        });
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByDifficulty",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.SORT_BY_DIFFICULTY);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByName",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.SORT_BY_NAME);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByStatus",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.SORT_BY_STATUS);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByTopic",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.SORT_BY_TOPIC);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showUncompletedExercises",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.FILTER_UNCOMPLETED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showCompletedExercises",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.FILTER_COMPLETED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showDownloadedExercises",
      cb: (): void => {
        nodeFilterProvider.toggleExerciseFilter(ExerciseFilter.FILTER_DOWNLOADED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showJoinedTracks",
      cb: (): void => {
        nodeFilterProvider.toggleTrackFilter(TrackFilter.FILTER_JOINED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.filterExercisesByTopic",
      cb: (topic: string): void => {
        nodeFilterProvider.filterByTopic(topic);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.clearFilters",
      cb: (): void => {
        nodeFilterProvider.clearFilters();
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.global.exportUserData",
      cb: async (): Promise<void> => {
        const uri = await vscode.window.showSaveDialog({});
        if (uri) {
          await promisify(fs.writeFile)(uri.fsPath, exercismController.getUserDataInJSON());
          await vscode.window.showTextDocument(uri);
        }
      }
    },
    {
      id: "exercism.global.importUserData",
      cb: async (): Promise<void> => {
        const uri = await vscode.window.showOpenDialog({ canSelectFolders: false, canSelectMany: false });
        if (uri && uri[0]) {
          const data = await promisify(fs.readFile)(uri[0].fsPath);
          exercismController.loadUserDataFromJSON(data.toString());
          tracksTreeProvider.refresh();
        }
      }
    },
    {
      id: "exercism.global.clearStorageData",
      cb: async (): Promise<void> => {
        const action = await vscode.window.showWarningMessage(
          "YOU ARE ABOUT TO PERMANENTLY DELETE ALL OF YOUR LOCAL DATA! PROCEED?",
          "Yes",
          "Cancel"
        );
        if (action === "Yes") {
          ExtensionManager.getAllStorageItems().forEach(item => {
            item.delete();
          });

          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      }
    },
    {
      id: "exercism.file.open",
      cb: (fileNode: FileNode): void => {
        vscode.window.showTextDocument(fileNode.resourceUri, {
          preview: true
        });
      }
    },
    {
      id: "exercism.file.delete",
      cb: (fileNode: FileNode): void => {
        fs.unlink(fileNode.resourceUri.fsPath, () => tracksTreeProvider.refresh(fileNode.parent));
      }
    },
    {
      id: "exercism.file.rename",
      cb: async (fileNode: FileNode): Promise<void> => {
        const oldPath = fileNode.resourceUri.fsPath;
        const oldFileName = path.basename(oldPath);
        const newFileName = await vscode.window.showInputBox({
          prompt: "Please enter the new file name.",
          value: oldFileName
        });
        if (newFileName) {
          fs.rename(oldPath, path.join(path.dirname(oldPath), newFileName), () =>
            tracksTreeProvider.refresh(fileNode.parent)
          );
        }
      }
    },
    {
      id: "exercism.file.submit",
      cb: async (fileNode: FileNode): Promise<void> => {
        try {
          await vscode.window.withProgress(
            {
              title: "Submitting exercise...",
              location: vscode.ProgressLocation.Notification
            },
            () =>
              exercismController.submitExerciseFile(getFileNodeExerciseNode(fileNode).exercise, fileNode.resourceUri)
          );
        } catch (e) {
          const action = await vscode.window.showErrorMessage(String(e), "Retry", "Cancel");
          if (action === "Retry") {
            return vscode.commands.executeCommand("exercism.file.submit", fileNode);
          } else {
            return;
          }
        }
        tracksTreeProvider.refresh(fileNode.parent);
      }
    }
  ].forEach((command: ICommand) => {
    ExtensionManager.subscribe(vscode.commands.registerCommand(command.id, command.cb));
  });
}

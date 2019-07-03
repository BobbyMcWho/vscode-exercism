import * as fs from "fs-extra";
import * as glob from "glob";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionManager } from "./common/context";
import { ExercismController } from "./exercism/controller";
import { ExerciseStatus } from "./typings/api";
import { ExerciseNode } from "./views/tree/nodes/exercise/exerciseNode";
import { ExerciseNodeFilterFlags } from "./views/tree/nodes/exercise/exerciseNodeFilter";
import { FileNode } from "./views/tree/nodes/file/fileNode";
import { TrackNode } from "./views/tree/nodes/track/trackNode";
import { TrackNodeFilterFlags } from "./views/tree/nodes/track/trackNodeFilter";
import { TracksTreeProvider } from "./views/tree/tracksTreeProvider";
import { ExerciseInfoPreview } from "./views/webview/exerciseInfoPreview";
import { TreeNodePreviewManager } from "./views/webview/previewManager";

export function RegisterCommands(exercismController: ExercismController, tracksTreeProvider: TracksTreeProvider): void {
  [
    {
      id: "exercism.track.toggleFocus",
      cb: (trackNode: TrackNode): void => {
        tracksTreeProvider.trackNodeFilter.focus(trackNode);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.track.openAsFolder",
      cb: async (trackNode: TrackNode): Promise<void> => {
        const dir = exercismController.getTrackDirPath(trackNode.track);
        await fs.ensureDir(dir);
        vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(dir));
      }
    },
    {
      id: "exercism.track.downloadAllExercises",
      cb: async (trackNode: TrackNode): Promise<void> => {
        let disposables: vscode.Disposable[] = [];
        try {
          vscode.window.withProgress(
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

              const exerciseNodes = await tracksTreeProvider.getTrackNodeChildren(trackNode);

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
        } finally {
          disposables.forEach(d => d.dispose());
        }
      }
    },
    {
      id: "exercism.exercise.createNewFile",
      cb: async (node: ExerciseNode | FileNode): Promise<void> => {
        const filename = await vscode.window.showInputBox({
          placeHolder: "New file name",
          prompt: "Input the name of the file you wish to create."
        });

        if (!filename) {
          return;
        }

        await fs.ensureFile(
          path.join(
            node instanceof ExerciseNode
              ? exercismController.getExerciseDirPath(node.parent.track, node.exercise)
              : node.resourceUri.fsPath,
            filename
          )
        );

        tracksTreeProvider.refresh(node);
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
      id: "exercism.exercise.openInBrowser",
      cb: async ({ parent: { track }, exercise }: ExerciseNode): Promise<void> => {
        const metadata = await exercismController.getExerciseMetadata(track, exercise);
        if (metadata) {
          vscode.env.openExternal(vscode.Uri.parse(metadata.url));
        }
      }
    },
    {
      id: "exercism.exercise.openInTerminal",
      cb: (node: ExerciseNode | FileNode): void => {
        const name = `Exercism - ${node.label}`;
        let terminal = vscode.window.terminals.find(terminal => terminal.name === name);
        if (!terminal) {
          terminal = vscode.window.createTerminal({
            cwd:
              node instanceof ExerciseNode
                ? exercismController.getExerciseDirPath(node.parent.track, node.exercise)
                : node.resourceUri.fsPath,
            name: `Exercism - ${node.label}`
          });
        }
        terminal.show();
      }
    },
    {
      id: "exercism.exercise.openStart",
      cb: async (exerciseNode: ExerciseNode): Promise<void> => {
        if (!(exerciseNode.exercise.status & ExerciseStatus.DOWNLOADED)) {
          const action = await vscode.window.showErrorMessage(
            `You can only open downloaded exercises. Would you like to download "${exerciseNode.id}"?`,
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

        const files = glob.sync(ExtensionManager.getConfigurationItem<string>("openStartGlob", ""), {
          cwd: exercismController.getExerciseDirPath(exerciseNode.parent.track, exerciseNode.exercise),
          absolute: true,
          nodir: true
        });

        if (tracksTreeProvider.view.visible) {
          vscode.commands.executeCommand("workbench.action.toggleSidebarVisibility");
        }

        if (files.length < 1) {
          await vscode.window.showErrorMessage(
            "We couldn't find any files matching the `openStartGlob` setting! Please make sure the glob includes the file extensions you want opened before trying again."
          );
          return;
        }

        if (files.length > 1) {
          vscode.commands.executeCommand("vscode.setEditorLayout", {
            orientation: 0,
            groups:
              files.length === 2
                ? [{ groups: [{}], size: 0.5 }, { groups: [{}], size: 0.5 }]
                : [{ groups: [{}], size: 0.5 }, { groups: [{}, {}], size: 0.5 }]
          });
        }

        for (let i = 0; i < files.length; i++) {
          await vscode.window.showTextDocument(vscode.Uri.file(files[i]), {
            preview: false,
            viewColumn: (i % 3) + 1
          });
        }
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByDifficulty",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.SORT_BY_DIFFICULTY);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByName",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.SORT_BY_NAME);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByStatus",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.SORT_BY_STATUS);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.sortExercisesByTopic",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.SORT_BY_TOPIC);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showUncompletedExercises",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.FILTER_UNCOMPLETED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showCompletedExercises",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.FILTER_COMPLETED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showDownloadedExercises",
      cb: (): void => {
        tracksTreeProvider.exerciseNodeFilter.toggle(ExerciseNodeFilterFlags.FILTER_DOWNLOADED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.filterExercisesByTopic",
      cb: (topic: string): void => {
        tracksTreeProvider.exerciseNodeFilter.filterByTopic(topic);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.showJoinedTracks",
      cb: (): void => {
        tracksTreeProvider.trackNodeFilter.toggle(TrackNodeFilterFlags.FILTER_JOINED);
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.view.tracks.clearFilters",
      cb: (): void => {
        tracksTreeProvider.trackNodeFilter.clear();
        tracksTreeProvider.exerciseNodeFilter.clear();
        tracksTreeProvider.refresh();
      }
    },
    {
      id: "exercism.global.exportUserData",
      cb: async (): Promise<void> => {
        const uri = await vscode.window.showSaveDialog({});
        if (uri) {
          await fs.writeFile(uri.fsPath, exercismController.getUserDataInJSON());
          vscode.window.showTextDocument(uri);
        }
      }
    },
    {
      id: "exercism.global.importUserData",
      cb: async (): Promise<void> => {
        const selectedFiles = await vscode.window.showOpenDialog({ canSelectFolders: false, canSelectMany: false });
        if (selectedFiles) {
          const firstFileSelectionUri = selectedFiles[0];
          const fileData = await fs.readFile(firstFileSelectionUri.fsPath);
          exercismController.loadUserDataFromJSON(fileData.toString());
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
      cb: async (fileNode: FileNode): Promise<void> => {
        await fs.remove(fileNode.resourceUri.fsPath);
        tracksTreeProvider.refresh(fileNode.parent);
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
            () => exercismController.submitExerciseFile(fileNode.getExerciseNode().exercise, fileNode.resourceUri)
          );
        } catch (e) {
          const action = await vscode.window.showErrorMessage(String(e), "Retry", "Cancel");
          if (action === "Retry") {
            return vscode.commands.executeCommand("exercism.file.submit", fileNode);
          } else {
            return;
          }
        }
        tracksTreeProvider.refresh(fileNode.getExerciseNode());
      }
    }
  ].forEach((command: { id: string; cb: (...args: any[]) => void | Promise<void> }) => {
    ExtensionManager.subscribe(vscode.commands.registerCommand(command.id, command.cb));
  });
}

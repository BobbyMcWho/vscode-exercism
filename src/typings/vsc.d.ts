import * as vscode from "vscode";

export interface CustomIconURI {
  light: vscode.Uri;
  dark: vscode.Uri;
}

declare module "vsc";

import { compare } from "../../../../common/utilities";
import { TreeNodeFilter } from "../treeNode";
import { FileNode } from "./fileNode";

export class FileNodeFilter implements TreeNodeFilter<FileNode> {
  private static _instance = new FileNodeFilter();

  private constructor() {}

  static get instance(): FileNodeFilter {
    return this._instance;
  }

  sieve(nodes: FileNode[]): FileNode[] {
    return nodes
      .sort((a, b) => compare<string>(a.label.toUpperCase(), b.label.toUpperCase()))
      .sort((a, b) => compare<boolean>(b.isDirectory, a.isDirectory));
  }
}

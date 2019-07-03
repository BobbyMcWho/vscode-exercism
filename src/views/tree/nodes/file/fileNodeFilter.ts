import * as path from "path";
import { compare } from "../../../../common/utilities";
import { TreeNodeFilter } from "../treeNode";
import { FileNode } from "./fileNode";

export class FileNodeFilter implements TreeNodeFilter<FileNode> {
  filter(nodes: FileNode[]): FileNode[] {
    return nodes
      .sort((a, b) => compare<boolean>(b.isDirectory, a.isDirectory))
      .sort((a, b) =>
        compare<boolean>(path.extname(a.resourceUri.fsPath) === ".md", path.extname(b.resourceUri.fsPath) === ".md")
      );
  }
}

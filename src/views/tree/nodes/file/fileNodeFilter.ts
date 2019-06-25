import { compare } from "../../../../common/utilities";
import { TreeNodeFilter } from "../treeNode";
import { FileNode } from "./fileNode";

export class FileNodeFilter implements TreeNodeFilter<FileNode> {
  filter(nodes: FileNode[]): FileNode[] {
    return nodes
      .sort((a, b) => compare<string>(a.label.toUpperCase(), b.label.toUpperCase()))
      .sort((a, b) => compare<boolean>(b.isDirectory, a.isDirectory));
  }
}

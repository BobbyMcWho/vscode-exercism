import * as marked from "marked";
import { h } from "preact";
import { State } from "./app";

export default ({ instructions, currentTab }: State) =>
  instructions ? (
    <div
      dangerouslySetInnerHTML={{ __html: marked.parse(instructions) }}
      className="nav-content"
      style={{ display: currentTab === "instructions" ? "block" : "none" }}
    />
  ) : (
    <div className="nav-content" style={{ display: currentTab === "instructions" ? "block" : "none" }}>
      You need to download this exercise before you can view its instructions.
    </div>
  );

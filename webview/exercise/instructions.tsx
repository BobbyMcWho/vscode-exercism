import * as marked from "marked";
import { h } from "preact";
import { ExerciseState } from "../utilities/store";

const Instructions = (props: ExerciseState) => {
  return props.instructions ? (
    <div dangerouslySetInnerHTML={{ __html: marked.parse(props.instructions) }} class="nav-content" />
  ) : (
    <div class="nav-content">You need to download this exercise before you can view its instructions.</div>
  );
};

export default Instructions;

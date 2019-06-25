import * as glob from "fast-glob";
import * as Mocha from "mocha";
import * as path from "path";

export async function run(cwd: string, cb: (error: any, failures?: number) => void): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    useColors: true,
    slow: 0
  });

  (await glob("**/**.test.js", { cwd })).forEach(file => {
    mocha.addFile(path.resolve(cwd, file));
  });

  try {
    mocha.run(failures => cb(null, failures));
  } catch (err) {
    cb(err);
  }
}

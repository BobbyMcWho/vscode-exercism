import Mocha from "mocha";
import * as path from "path";
import glob from "tiny-glob";

export async function run(cwd: string, cb: (error: any, failures?: number) => void): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    useColors: true,
    slow: 0
  });
  
  const files = await glob("**/**.test.js", { cwd });

  files.forEach(f => mocha.addFile(path.resolve(cwd, f)));

  try {
    mocha.run(failures => cb(null, failures));
  } catch (err) {
    cb(err);
  }
}

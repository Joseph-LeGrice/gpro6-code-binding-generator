import { ArgumentParser } from 'argparse'
import * as fs from 'fs-extra'
import { GenerationConfig } from './config/generation-config';
import { CppGenerator } from './generation/cpp-generator';

var parser = new ArgumentParser();
parser.addArgument(['FILE']);

var args = parser.parseArgs();
var json = fs.readJsonSync(args.FILE);
const config = new GenerationConfig(json);
console.log(config);

const gen = new CppGenerator(config);
console.log(gen.cppHeaderFileTemplate());
console.log(gen.cppSourceFileTemplate());
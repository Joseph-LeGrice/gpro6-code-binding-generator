import { ArgumentParser } from 'argparse'
import * as fs from 'fs-extra'
import { GenerationConfig } from './config/generation-config';
import { CppGenerator } from './generation/cpp-generator';
import { CsGenerator } from './generation/cs-generator';

var parser = new ArgumentParser();
parser.addArgument(['FILE']);

var args = parser.parseArgs();
var json = fs.readJsonSync(args.FILE);
const config = new GenerationConfig(json);
console.log(config);

const cppGen = new CppGenerator(config);
console.log(cppGen.cppHeaderFileTemplate());
console.log(cppGen.cppSourceFileTemplate());

const csGen = new CsGenerator(config);
console.log(csGen.csFileTemplate());
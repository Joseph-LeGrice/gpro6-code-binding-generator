import * as path from 'path'
import * as fs from 'fs-extra'
import { ArgumentParser } from 'argparse'
import { GeneratedType } from './config/argument-info';
import { CsGenerator } from './generation/cs-generator';
import { CppGenerator } from './generation/cpp-generator';
import { GenerationConfig } from './config/generation-config';

var parser = new ArgumentParser({addHelp: true});
parser.addArgument(['--input-directory'], { required: true });
parser.addArgument(['--output-cpp-directory'], { required: true });
parser.addArgument(['--output-cs-directory'], { required: true });


var args = parser.parseArgs();

main();

async function main() : Promise<void> {
    fs.removeSync(args.output_cpp_directory);
    fs.removeSync(args.output_cs_directory);

    const stat = fs.statSync(args.input_directory);
    if (stat.isFile()) {
        await parseFile(args.input_directory);
    } else if (stat.isDirectory()) {
        await parseDirectory(args.input_directory);
    }
    console.log("FINISHED");
}

async function parseDirectory(inputPath: string) : Promise<void> {
    const tasks: Array<Promise<void>> = new Array<Promise<void>>();
    for (const p of fs.readdirSync(args.input_directory)) {
        const fullPath = path.join(inputPath, p);
        const stat = fs.statSync(fullPath);
        if (stat.isFile) {
            tasks.push(parseFile(fullPath));
        } else if (stat.isDirectory) {
            tasks.push(parseDirectory(fullPath));
        }
    }
    await Promise.all(tasks);
}

async function parseFile(inputPath: string) : Promise<void> {
    var json = fs.readJsonSync(inputPath);
    const config = new GenerationConfig(json);
    
    const cppGen = new CppGenerator(config);
    const cppHeader = cppGen.cppHeaderFileTemplate();
    const cppSource = cppGen.cppSourceFileTemplate();
    
    const csGen = new CsGenerator(config);
    const csSource = csGen.csFileTemplate();
    
    const cppHeaderFilePath = path.join(args.output_cpp_directory, `${config.className(GeneratedType.cpp)}API.h`);
    const cppSourceFilePath = path.join(args.output_cpp_directory, `${config.className(GeneratedType.cpp)}API.cpp`);
    const csSourceFilePath = path.join(args.output_cs_directory, `${config.className(GeneratedType.cs)}.cs`);

    fs.ensureDirSync(args.output_cpp_directory);
    fs.ensureDirSync(args.output_cpp_directory);
    fs.ensureDirSync(args.output_cs_directory);

    await Promise.all([
        fs.writeFile(cppHeaderFilePath, cppHeader),
        fs.writeFile(cppSourceFilePath, cppSource),
        fs.writeFile(csSourceFilePath, csSource)
    ]);
}
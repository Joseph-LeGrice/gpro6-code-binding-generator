import * as path from 'path'
import * as fs from 'fs-extra'
import { ArgumentParser } from 'argparse'
import { FileBinding } from './config/file-binding';
import { GeneratedType } from './config/argument-binding';
import { CsBindingGenerator } from './generation/cs/cs-binding-generator';
import { CppBindingGenerator } from './generation/cpp/cpp-binding-generator';
import { BindingCongfiguration } from './config/binding-configuration';

var parser = new ArgumentParser({ addHelp: true });
parser.addArgument(['CONFIG_FILE'], { required: true, help: "Configuration File for Binding Generation" });

var args = parser.parseArgs();

main();

async function main() : Promise<void> {
    var json = fs.readJsonSync(args.CONFIG_FILE);
    const config: BindingCongfiguration = new BindingCongfiguration(json);

    fs.removeSync(config.outputCppDirectory);
    fs.removeSync(config.outputCsDirectory);

    fs.ensureDirSync(config.outputCppDirectory);
    fs.ensureDirSync(config.outputCsDirectory);

    const allPromises: Array<Promise<void>> = new Array<Promise<void>>();
    for (const file of config.fileBindings) {
        const cppGen = new CppBindingGenerator(file);
        const cppHeader = cppGen.generateHeaderFile();
        const cppSource = cppGen.generateSourceFile();
        
        const csGen = new CsBindingGenerator(file);
        const csSource = csGen.csFileTemplate();
        
        const cppHeaderFilePath = path.join(config.outputCppDirectory, `${file.className(GeneratedType.cpp)}API.h`);
        const cppSourceFilePath = path.join(config.outputCppDirectory, `${file.className(GeneratedType.cpp)}API.cpp`);
        const csSourceFilePath = path.join(config.outputCsDirectory, `${file.className(GeneratedType.cs)}.cs`);

        allPromises.push(fs.writeFile(cppHeaderFilePath, cppHeader));
        allPromises.push(fs.writeFile(cppSourceFilePath, cppSource));
        allPromises.push(fs.writeFile(csSourceFilePath, csSource));
    }
    await Promise.all(allPromises);    
}
import * as path from "path";
import * as fs from "fs-extra";
import { ArgumentParser } from "argparse";
import { BindingConfiguration, FileBinding } from "./config/binding-config";
import { GeneratedType } from "./config/argument-binding";
import { CppHeaderGenerator } from "./generation/cpp-header-file-generator";
import { CppSourceGenerator } from "./generation/cpp-source-file-generator";
import { CppBindingHeaderGenerator, CppBindingSourceGenerator } from "./generation/cpp-binding-registration-generator";
import { CsBindingGenerator } from "./generation/cs-binding-generator";
import { TemplateGenerator } from "./generation_new/generator";
import { loadTemplate } from "./generation_new/templates/template-loader";
import { loadData } from "./generation_new/data/config-loader";

const parser = new ArgumentParser({ addHelp: true });
parser.addArgument(["CONFIG_FILE"], { help: "Configuration File for Binding Generation" });

const args = parser.parseArgs();

// main();

const lookup = loadTemplate("cs");
const generator = new TemplateGenerator(lookup);

const data = loadData("cs");
generator.generate(data);

async function main(): Promise<void> {
  const config: BindingConfiguration = fs.readJsonSync(args.CONFIG_FILE);
  const configFileDir = path.dirname(args.CONFIG_FILE);
  config.outputCppDirectory = path.resolve(configFileDir, config.outputCppDirectory);
  config.outputCsDirectory = path.resolve(configFileDir, config.outputCsDirectory);

  console.log("[CodeBindingGenerator] Loaded Configuration");
  console.log(`[CodeBindingGenerator] config.outputCppDirectory: ${config.outputCppDirectory}`);
  console.log(`[CodeBindingGenerator] config.outputCsDirectory: ${config.outputCsDirectory}`);

  fs.ensureDirSync(config.outputCppDirectory);
  fs.ensureDirSync(config.outputCsDirectory);

  const allPromises = new Array<Promise<void>>();

  const bindingHeaderGen = new CppBindingHeaderGenerator(config);
  allPromises.push(bindingHeaderGen.generate());

  const bindingSourceGen = new CppBindingSourceGenerator(config);
  allPromises.push(bindingSourceGen.generate());

  const sourceGen = new CppSourceGenerator(config);
  allPromises.push(sourceGen.generate());

  const headerGen = new CppHeaderGenerator(config);
  allPromises.push(headerGen.generate());

  const csGen = new CsBindingGenerator(config);
  allPromises.push(csGen.generate());

  await Promise.all(allPromises);
}

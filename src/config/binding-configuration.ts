import * as path from 'path'
import { FileBinding } from "./file-binding";

export class BindingCongfiguration
{
    public namespace: string;
    public fileBindings: Array<FileBinding>;

    public outputCppDirectory: string;
    public outputCsDirectory: string;

    constructor(json: any, configFilePath: string) {
        this.outputCppDirectory = path.resolve(configFilePath, json.outputCppDirectory);
        this.outputCsDirectory = path.resolve(configFilePath, json.outputCsDirectory);
        this.namespace = json.namespace;
        this.fileBindings = new Array<FileBinding>();
        for (const genJson of json.fileBindings) {
            this.fileBindings.push(new FileBinding(genJson));
        }
    }
}
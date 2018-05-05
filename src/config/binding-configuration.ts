import { FileBinding } from "./file-binding";

export class BindingCongfiguration
{
    public namespace: string;
    public fileBindings: Array<FileBinding>;

    public inputDirectory: string;
    public outputCppDirectory: string;
    public outputCsDirectory: string;

    constructor(json: any) {
        this.inputDirectory = json.inputDirectory;
        this.outputCppDirectory = json.outputCppDirectory;
        this.outputCsDirectory = json.outputCsDirectory;
        this.namespace = json.namespace;
        this.fileBindings = new Array<FileBinding>();
        for (const genJson of json.configs) {
            this.fileBindings.push(new FileBinding(genJson));
        }
    }
}
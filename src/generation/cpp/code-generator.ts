import * as fs from 'fs-extra'
import * as path from 'path'
import { BindingCongfiguration } from "../../config/binding-configuration";
import { FileBinding } from "../../config/file-binding";

export abstract class Generator
{
    constructor(protected config: BindingCongfiguration) { }
    
    public abstract async generate(): Promise<void>;
}

export abstract class BatchFileGenerator extends Generator
{
    public async generate(): Promise<void>
    {
        const allPromises: Array<Promise<void>> = new Array<Promise<void>>();
        for (const fileConfig of this.config.fileBindings) {
            const generatedFile = this.generateFile(fileConfig);
            const filePath = this.getFileName(fileConfig);
            fs.ensureDirSync(path.dirname(filePath));
            allPromises.push(fs.writeFile(filePath, generatedFile));
        }
        await Promise.all(allPromises);    
    }
    
    protected abstract getFileName(file: FileBinding): string;
    protected abstract generateFile(file: FileBinding): string;
}
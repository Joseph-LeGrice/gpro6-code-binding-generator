import * as fs from 'fs-extra'
import * as path from 'path'
import { BindingConfiguration, FileBinding } from "../config/binding-config";

export abstract class Generator {
  constructor(protected config: BindingConfiguration) { }
  public abstract async generate(): Promise<void>;
}

export abstract class SingleFileGenerator extends Generator {
  public async generate(): Promise<void> {
    const filePath = this.getFileName();
    return Promise.resolve().then(() => {
      if (!fs.existsSync(filePath)) {
        fs.ensureDirSync(path.dirname(filePath));
        const fileSkeletonText = this.generateFileSkeleton();
        return fs.writeFile(filePath, fileSkeletonText).then(() => {
          return fileSkeletonText;
        });
      } else {
        return fs.readFile(filePath, 'utf8');
      }
    }).then((fileText) => {
      const generatedText = this.appendMethodInfo(fileText);
      return fs.writeFile(filePath, generatedText);
    });
  }

  protected abstract getFileName(): string;
  protected abstract generateFileSkeleton(): string;
  protected abstract appendMethodInfo(fileText: string): string;
}

export abstract class BatchFileGenerator extends Generator {
  public async generate(): Promise<void> {
    const allPromises: Array<Promise<void>> = new Array<Promise<void>>();
    for (const fileConfig of this.config.fileBindings) {
      const filePath = this.getFileName(fileConfig);
      const p = Promise.resolve().then(() => {
        if (!fs.existsSync(filePath)) {
          const fileSkeletonText = this.generateFileSkeleton(fileConfig);
          fs.ensureDirSync(path.dirname(filePath));
          return fs.writeFile(filePath, fileSkeletonText).then(() => {
            return fileSkeletonText;
          });
        } else {
          return fs.readFile(filePath, 'utf8');                    
        }
      }).then((fileText) => {
        const generatedText = this.appendMethodInfo(fileConfig, fileText);
        return fs.writeFile(filePath, generatedText);
      });
      allPromises.push(p);
    }
    await Promise.all(allPromises);    
  }
  
  protected abstract getFileName(file: FileBinding): string;
  protected abstract generateFileSkeleton(file: FileBinding): string;
  protected abstract appendMethodInfo(file: FileBinding, fileText: string): string;
}

export const GeneratorUtil = {
  delimiter: '// ## Generated Code ##',
  
  clear: function(existingText: string): string {
    const delimiterStartIndex = existingText.indexOf(this.delimiter);
    const delimiterEndIndex = existingText.lastIndexOf(this.delimiter);
    const sectionA = existingText.slice(0, delimiterStartIndex + this.delimiter.length);
    const sectionB = existingText.slice(delimiterEndIndex);
    return sectionA.concat(sectionB);
  },

  insert: function(toInsert: string, existingText: string): string {
    const delimiterEndIndex = existingText.lastIndexOf(this.delimiter);
    const sectionA = existingText.slice(0, delimiterEndIndex);
    const sectionB = existingText.slice(delimiterEndIndex);
    return sectionA.concat('\n', toInsert, '\n', sectionB);
  }
}
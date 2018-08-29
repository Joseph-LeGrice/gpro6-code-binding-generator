import * as fs from "fs-extra";
import * as path from "path";
import { ITemplate, ITemplateLookup } from "./templates/template-loader";
import { IConfigurationItem, IConfigurationLookup, IConfiguration } from "./data/config-loader";

export class TemplateGenerator {
  private existingLines: string[] | undefined;

  constructor(
    private lookup: ITemplateLookup
  ) { }

  public async generate(data: IConfiguration) {
    const filepath = path.join(__dirname, data.outputFile);
    await fs.ensureDir(path.dirname(filepath));

    if (fs.existsSync(filepath)) {
      const existingText = await fs.readFile(filepath, "utf8");
      this.existingLines = existingText.split("\n");
    }

    const result = this.process(data.contents);
    console.log(result);
    await fs.writeFile(filepath, result);
  }

  private process(configMap: IConfigurationLookup): string {
    const result: string[] = [];
    const configIds = Object.keys(configMap);
    for (const id of configIds) {
      const template = this.lookup[id];
      const configs = configMap[id];
      for (const c of configs) {
        result.push(...this.processItem(c, template));
      }
    }
    return result.join("\n");
  }

  private processItem(
    item: IConfigurationItem, template: ITemplate
  ): string[] {
    const result: string[] = [];
    for (const templateLine of template.body) {
      const regex = /(?<=\$)([a-z0-9\-]+)/g;
      const symbolResults = templateLine.match(regex);
      if (symbolResults) {
        if (
          symbolResults.length === 1 &&
          this.lookup[symbolResults[0]] &&
          this.lookup[symbolResults[0]].repeatable
        ) {
          const childLines = this.processMultiLine(symbolResults, item, templateLine);
          result.push(...childLines);
        } else {
          result.push(this.processSingleLine(symbolResults, item, templateLine));
        }
      } else {
        result.push(templateLine);
      }
    }
    return result;
  }

  private processMultiLine(
    symbolResults: string[], item: IConfigurationItem, templateLine: string
  ): string[] {
    const childConfigs = item.children[symbolResults[0]];
    const template = this.lookup[symbolResults[0]];
    if (childConfigs && childConfigs.length > 0) {
      const prefix = templateLine.replace(`$${symbolResults[0]}`, "");
      let results: string[] = [];
      for (let i = 0; i < childConfigs.length; i++) {
        const config = childConfigs[i];
        results = results.concat(
          this.processItem(config, template).map((ccr) => `${prefix}${ccr}`)
        );
        if (template.joiner !== undefined && i < childConfigs.length - 1) {
          results.push(template.joiner);
        }
      }
      return results;
    } else {
      return [];
    }
  }

  private processSingleLine(
    symbolResults: string[], item: IConfigurationItem, templateLine: string
  ): string {
    let line = templateLine;
    for (const symbol of symbolResults) {
      const i = parseInt(symbol);
      if (!isNaN(i)) {
        if (i < item.data.length) {
          line = line.replace(`$${symbol}`, item.data[i]);
        } else {
          line = line.replace(`$${symbol}`, "");
        }
      } else {
        const childConfigs = item.children[symbol];
        const childTemplate = this.lookup[symbol];
        if (childConfigs && childConfigs.length > 0) {
          let ccResults: string[] = [];
          for (const config of childConfigs) {
            ccResults = ccResults.concat(this.processItem(config, childTemplate));
          }

          const seperator = childTemplate.joiner ? childTemplate.joiner : "";
          line = line.replace(`$${symbol}`, ccResults.join(seperator));
        } else {
          line = line.replace(`$${symbol}`, "");
        }
      }
    }
    return line;
  }
}

import { TemplateLookup, loadTemplate, Template } from "./templates/template-loader"
import { loadData, ConfigurationItem, ConfigurationLookup } from "./data/config-loader";


const lookup = loadTemplate("cs");

export function Generate() {
  const data = loadData("cs");
  const result = Process(data.contents);
  console.log(result)
}

function Process(configMap: ConfigurationLookup) {
  const result: string[] = [];
  const configIds = Object.keys(configMap);
  for (const id of configIds) {
    const template = lookup[id];
    const configs = configMap[id];
    for (const c of configs) {
      result.push(...processItem(c, template));
    }
  }
  return result.join("\n");
}

function processItem(item: ConfigurationItem, template: Template): string[] {
  const result: string[] = [];
  for (const templateLine of template.body) {
    const regex = /(?<=\$)([a-z0-9\-]+)/g;
    const symbolResults = templateLine.match(regex);
    if (symbolResults) {
      if (
        symbolResults.length === 1 &&
        lookup[symbolResults[0]] &&
        lookup[symbolResults[0]].repeatable
      ) {
        const childLines = processMultiLine(symbolResults, item, templateLine);
        result.push(...childLines);
      } else {
        result.push(processSingleLine(symbolResults, item, templateLine));
      }
    } else {
      result.push(templateLine);
    }
  }
  return result;
}

function processMultiLine(
  symbolResults: string[], item: ConfigurationItem, templateLine: string
): string[] {
  const childConfigs = item.children[symbolResults[0]];
  const template = lookup[symbolResults[0]];
  if (childConfigs && childConfigs.length > 0) {
    const prefix = templateLine.replace(`$${symbolResults[0]}`, "");
    let results: string[] = []
    for(let i=0; i<childConfigs.length; i++) {
      const config = childConfigs[i];
      results = results.concat(
        processItem(config, template).map((ccr) => `${prefix}${ccr}`)
      );
      if (template.joiner && i < childConfigs.length - 1) {
        results.push(template.joiner);
      }
    }
    return results;
  } else {
    return [];
  }
}

function processSingleLine(
  symbolResults: string[], item: ConfigurationItem, templateLine: string
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
      const childTemplate = lookup[symbol];
      if (childConfigs && childConfigs.length > 0) {
        let ccResults: string[] = []
        for(const config of childConfigs) {
          ccResults = ccResults.concat(processItem(config, childTemplate));
        }
        
        let seperator = childTemplate.joiner ? childTemplate.joiner : "";
        line = line.replace(`$${symbol}`, ccResults.join(seperator));
      } else {
        line = line.replace(`$${symbol}`, "");
      }
    }
  }
  return line;
}
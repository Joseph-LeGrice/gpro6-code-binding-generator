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
      result.push(...ProcessItem(c, template));
    }
  }
  return result.join("\n");
}

function ProcessItem(item: ConfigurationItem, template: Template): string[] {
  const result: string[] = [];
  for (const templateLine of template.body) {
    const regex = /(?<=\$)([a-z0-9\-]+)/g;
    const symbolResults = templateLine.match(regex);
    if (symbolResults) {
      let shouldAdd = false;
      let line = templateLine;
      for (const symbol of symbolResults) {
        const i = parseInt(symbol);
        if (!isNaN(i)) {
          if (i < item.data.length) {
            shouldAdd = true;
            line = line.replace(`$${symbol}`, item.data[i]);
          } else {
            line = line.replace(`$${symbol}`, "");
          }
        } else {
          const childConfigs = item.children[symbol];
          if (childConfigs) {
            const childTemplate = lookup[symbol];
            
            let ccResults: string[] = []
            for(const config of childConfigs) {
              ccResults = ccResults.concat(ProcessItem(config, childTemplate));
            }
            
            if (ccResults.length > 0) {
              shouldAdd = true;

              let seperator = childTemplate.joiner ? childTemplate.joiner : "\n";
              if (childTemplate.repeatable) {
                seperator = seperator + templateLine.replace(`$${symbol}`, "");
              }

              line = line.replace(
                `$${symbol}`,
                ccResults.join(seperator)
              );
            }
          } else {
            line = line.replace(`$${symbol}`, "");
          }
        }
      }

      if (shouldAdd) {
        result.push(line);
      }
    } else {
      result.push(templateLine);
    }
  }
  return result;
}

// Process(c.children, lookup);

function processSymbol(s: string, item: ConfigurationItem) {
  const i = parseInt(s);
  if (i) {
    return item.data[i];
  } else {
    const matchingChild = item.children
  }
}
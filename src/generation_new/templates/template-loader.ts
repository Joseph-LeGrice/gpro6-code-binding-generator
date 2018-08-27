import CSharpTemplates from "./cs-templates.json";

export interface ITemplate {
  id: string;
  name: string;
  joiner?: string;
  repeatable?: boolean;
  body: string[];
}

export interface ITemplateLookup { [id: string]: ITemplate; }

// TODO: Store all templates in mongodb database, do a find query here and put the results into a template lookup map

export function loadTemplate(type: string): ITemplateLookup {
  const result: ITemplateLookup = {};
  for (const t of CSharpTemplates) {
    result[t.id] = t;
  }
  return result;
}

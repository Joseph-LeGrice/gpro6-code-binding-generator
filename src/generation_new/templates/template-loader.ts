import CSharpTemplates from "./cs-templates.json"

export interface Template {
  id: string;
  name: string;
  joiner?: string;
  repeatable?: boolean;
  body: string[];
}

export type TemplateLookup = { [id: string]: Template };

// TODO: Store all templates in mongodb database, do a find query here and put the results into a template lookup map

export function loadTemplate(type: string): TemplateLookup {
  let result: TemplateLookup = {};
  for (const t of CSharpTemplates) {
    result[t.id] = t;
  }
  return result;
}
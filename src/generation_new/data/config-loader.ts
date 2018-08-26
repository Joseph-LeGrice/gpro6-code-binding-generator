import TestData from "./dummy-data.json"

export type ConfigurationLookup = { [id: string]: ConfigurationItem[] };

export interface Configuration {
  name: string;
  language: string;
  contents: ConfigurationLookup;
}

export interface ConfigurationItem {
  data: string[];
  children: ConfigurationLookup
}

// TODO: Data to be saved / loaded from a mongodb instance

export function loadData(id: string): Configuration {
  return TestData;
}
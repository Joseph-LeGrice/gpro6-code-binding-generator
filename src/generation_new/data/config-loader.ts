import TestData from "./dummy-data.json";

export interface IConfigurationLookup { [id: string]: IConfigurationItem[]; }

export interface IConfiguration {
  name: string;
  language: string;
  outputFile: string;
  contents: IConfigurationLookup;
}

export interface IConfigurationItem {
  data: string[];
  children: IConfigurationLookup;
}

// TODO: Data to be saved / loaded from a mongodb instance

export function loadData(id: string): IConfiguration {
  return TestData;
}

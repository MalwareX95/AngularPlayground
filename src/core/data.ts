export interface DataScope {
    name: string,
    systemId: string,
  }

export const DataScopes: DataScope[] = [
    {name: 'DataScopeA', systemId: 'A'},
    {name: 'DataScopeB', systemId: 'A'},
    {name: 'DataScopeC', systemId: 'B'},
    {name: 'DataScopeD', systemId: 'B'},
    {name: 'DataScopeE', systemId: 'C'},
]
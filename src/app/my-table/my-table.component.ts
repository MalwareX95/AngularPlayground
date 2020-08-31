import { group } from 'console';
import { Component, OnInit } from '@angular/core';
import { CarTableDataService } from '../car-table-data.service';
import { ObjectUnsubscribedError } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { MatTableDataSource, MatCheckboxChange } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export class Group {
   displayContent: string;
   totalCount = 0;
   isExpanded = true;
   elements: any[];
   key: any;
   level?: number;
}

@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrls: ['./my-table.component.css']
})
export class MyTableComponent implements OnInit {
  constructor(protected dataSourceService: CarTableDataService) { }

  _groupColumns = ['brand', 'year'];

  get groupColumns(){
    return this._groupColumns;
  }

  set groupColumns(value){
    this._groupColumns = value;
    this.dataSource.data = this.getGroupedData();
  }

  public dataSource = new MatTableDataSource<any | Group>([]);

  _data: any[];
  
  _groupedData: any[];

  columns = ['vin', 'brand', 'year', 'color'];

  displayColumns = ['select', ...this.columns]

  selection: SelectionModel<any>;

  _groupsCount = 0;

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length - this._groupsCount;
    return numSelected == numRows;
  }

  toggleRow(row: any){
    if(!(row instanceof Group)){
      this.selection.toggle(row.item);
    }
  }

  selectRow = (row: any) => {
    if(!(row instanceof Group)){
      this.selection.select(row.item);
    }
  }


  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(this.selectRow);
  }

  getVisibleDataRows(){
     return this._groupedData.filter(x => x instanceof Group ? true : x.group.isExpanded)
  }

  toggleGroup($event: MatCheckboxChange, group: Group){
    const action = ($event.checked ? this.selection.select : this.selection.deselect).bind(this.selection);
    group.elements.forEach(x => action(x));
  }

  groupHeaderClicked(row: Group){
    row.isExpanded = !row.isExpanded;
    this.dataSource.data = this.getVisibleDataRows();
  }

  removeGroupColumn($event, column: string){
     $event.stopPropagation();
     this.groupColumns = this.groupColumns.filter(x => x != column);
  }

  addGroupColumn($event, column: string){
    $event.stopPropagation();
    this.groupColumns = Array.from(new Set([...this.groupColumns, column]));
  }

  getKey(_object){
     return this.groupColumns.map(column => _object[column]);
  }

  everyChildrenSelected(group: Group){
    return group.elements.every(x => this.selection.isSelected(x));
  }

  someChildrenSelected(group: Group){
     const count = group.elements.reduce((accumulator, element) => 
        this.selection.isSelected(element) ? ++accumulator : accumulator, 0);
     return count > 0 ? count < group.elements.length : false;
  }


  createSortingGroup(key:string, data: any[]){
    const groups = new Map<string, any[]>();
    
    for (const _object of data) {
        const propertyValue = _object[key];
        if(groups.has(propertyValue)){
          const group = groups.get(propertyValue);
          group.push(_object);
        }
        else {
          groups.set(propertyValue, [_object]);
        }
    }
    return groups;
  }


  sortData(keys:string[], data: any[], index = 0){
    if(index == keys.length) return data;
    const key = keys[index++];
    
    const sortedData = data.slice().sort(({[key]: a}, {[key]: b}) => {
      switch(typeof(a)){
        case 'number': return a - b;
        default: return a.toString().localeCompare(b.toString());
      }
    });

    const sortingGroup = this.createSortingGroup(key, sortedData);
    const result = []
    for (const [, group] of sortingGroup) {
         result.push(...this.sortData(keys, group, index))
    }
    return result;
  }

  getGroupedData(){
    const groups = new Map<string, any[]>();
    const data = this.sortData(this.groupColumns, this._data);
    for (const _object of data) {
      const key = JSON.stringify(this.getKey(_object));
        if(groups.has(key)){
          const group = groups.get(key);
          group.push(_object);
        }
        else {
          groups.set(key, [_object]);
        }
    }
    
    this._groupsCount = this.groupColumns.length > 0 ? groups.size : 0;

    this._groupedData = Array.from(groups).reduce((accumulator, [key, groupedElements]) => {
      const group = new Group();
      group.key = key;
      group.displayContent = key;
      group.totalCount = groupedElements.length;
      group.elements = groupedElements;
      if(this._groupColumns.length > 0) accumulator.push(group);
      accumulator.push(...groupedElements.map(item => ({item, group})));
      return accumulator;
    }, []);
    return this._groupedData;
  }

  isGroup(index, item): boolean {
    return item instanceof Group;
  }

  ngOnInit() {
    this.selection = new SelectionModel<any>(true, []);
    this.dataSourceService.getAllData()
      .subscribe((response:any) => {
        this._data = response;
        this.dataSource.data = this.getGroupedData();
      })
  }
}

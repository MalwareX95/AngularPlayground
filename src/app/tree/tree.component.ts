import {FlatTreeControl} from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface FoodNode {
  item: string;
  children?: FoodNode[];
}



interface Node {
  item: string,
  children?: Node[]
}

const TREE_DATA: FoodNode[] = [
  {
    item: 'Fruit',
    children: [
      {item: 'Apple'},
      {item: 'Banana'},
      {item: 'Fruit loops'},
    ]
  }, {
    item: 'Vegetables',
    children: [
      {
        item: 'Green',
        children: [
          {item: 'Broccoli'},
          {item: 'Brussel sprouts'},
        ]
      }, {
        item: 'Orange',
        children: [
          {item: 'Pumpkins'},
          {item: 'Carrots'},
        ]
      },
    ]
  },
];

/** Flat node with expandable and level information */
interface NodeDescriptor {
  expandable: boolean;
  item: string;
  level: number;
}

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  private transformer = (node: Node, level: number) =>  {
    return {
      expandable: !!node.children && node.children.length > 0,
      item: node.item,
      level: level,
    } as NodeDescriptor;
  }

  treeControl = new FlatTreeControl<NodeDescriptor>(
      node => node.level, 
      node => node.expandable
      );

  treeFlattener = new MatTreeFlattener(
      this.transformer, 
      node => node.level, 
      node => node.expandable, 
      node => node.children
      );
      
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  checklistSelection = new SelectionModel<NodeDescriptor>(true /* multiple */);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  leafItemSelectionToggle(node: NodeDescriptor): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  itemSelectionToggle(node: NodeDescriptor): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  isDescendantsAllSelected(node: NodeDescriptor): boolean {
    const descendants = this.treeControl.getDescendants(node);  
    return descendants.length > 0 && descendants.every(child => this.checklistSelection.isSelected(child));
  }

  isDescendantsPartiallySelected(node: NodeDescriptor): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.isDescendantsAllSelected(node);
  }


    /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: NodeDescriptor): void {
    let parent: NodeDescriptor | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  checkRootNodeSelection(node: NodeDescriptor): void {
    const isNodeSelected = this.checklistSelection.isSelected(node);
    const isDescendantsAllSelected = this.isDescendantsAllSelected(node);
    if (isNodeSelected && !isDescendantsAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!isNodeSelected && isDescendantsAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: NodeDescriptor): NodeDescriptor | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }


  ngOnInit(): void {
  }

  hasChild = (_: number, node: NodeDescriptor) => node.expandable;
  getLevel = (node: NodeDescriptor) => node.level;
}


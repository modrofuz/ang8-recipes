import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ingredient } from './../shared/ingredient.model';

export class ShoppingListService {
  private ingredients: Ingredient[] = [];
  // ingredientsChanged = new EventEmitter<Ingredient[]>();
  ingredientsChanged = new Subject<Ingredient[]>();
  startedEditing = new Subject<number>();

  constructor() {
    this.ingredients.push(new Ingredient('Apple', 5));
    setTimeout(() => {
      this.ingredients.push(new Ingredient('Tomato', 10));
      // this.ingredientsChanged.emit(this.ingredients.slice());
      this.ingredientsChanged.next(this.ingredients.slice());
    }, 2000);
  }

  getIngredients(): Ingredient[] {
    return this.ingredients.slice();
  }

  getIngredient(index: number): Ingredient {
    return this.ingredients[index];
  }

  addIngredient(ingredient: Ingredient): void {
    this.ingredients.push(ingredient);
    // this.ingredientsChanged.emit(this.ingredients.slice());
    this.ingredientsChanged.next(this.ingredients.slice());
  }

  deleteIngredient(index: number): void {
        this.ingredients.splice(index, 1);
        this.ingredientsChanged.next(this.ingredients.slice());
  }

  addingridients(ingridients: Ingredient[]): void {
    this.ingredients.push(...ingridients);
    // this.ingredientsChanged.emit(this.ingredients.slice());
    this.ingredientsChanged.next(this.ingredients.slice());
  }

  updateIngredient(index: number, newInredient: Ingredient): void {
    this.ingredients[index] = newInredient;
    this.ingredientsChanged.next(this.ingredients.slice());
  }
}

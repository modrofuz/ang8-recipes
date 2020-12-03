import { Subject } from 'rxjs';
import { ShoppingListService } from './../shopping-list/shopping-list.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Recipe } from './recipe.model';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();
  selectedRecipe = new EventEmitter<Recipe>();
  private recipes: Recipe[] = [];

  constructor(private shoppingListService: ShoppingListService) {
    /*  const newRecipe = new Recipe(
      'A Test Recipe',
      'Test',
      'https://www.recipe30.com/wp-content/uploads/2016/11/Glazed-carrots.jpg',
      [new Ingredient('Meat', 1), new Ingredient('French Fries', 20)]
    );
    const anotherRecipe = new Recipe(
      'Another Recipe',
      'Test',
      'https://www.theidearoom.net/wp-content/uploads/2016/05/thai-pineapple-fried-rice-recipe.jpg',
      [new Ingredient('buns', 2), new Ingredient('Meat', 2)]
    );
    this.recipes = [newRecipe, anotherRecipe]; */
  }

  setRecipes(recipes: Recipe[]): void {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes(): Recipe[] {
    // copy of recipes
    return this.recipes.slice();
  }

  getRecipeById(index: number): Recipe {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredinets: Ingredient[]): void {
    this.shoppingListService.addingridients(ingredinets);
  }

  updateRecipe(index: number, newRecipe: Recipe): void {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  addRecipe(recipe: Recipe): void {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number): void {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}

import { Subscription, Subject } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Ingredient } from '../../shared/ingredient.model';
import { ShoppingListService } from './../shopping-list.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static: false}) shoppingListForm: NgForm;

  subscription = new Subscription();
  $unsubSubject = new Subject<any>();
  editMode: boolean;
  itemIndex: number;
  editedItem: Ingredient;

  constructor(private shopingListService: ShoppingListService) { }

  ngOnInit(): void {
      this.shopingListService.startedEditing
      .pipe(takeUntil(this.$unsubSubject))
      .subscribe((index: number) => {
        this.editMode = true;
        this.itemIndex = index;
        this.editedItem = this.shopingListService.getIngredient(this.itemIndex);
        this.shoppingListForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount,
        });
      });
  }

  onSubmit(form: NgForm): void {
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if (this.editMode) {
      this.shopingListService.updateIngredient(this.itemIndex, newIngredient);
    } else {
      this.shopingListService.addIngredient(newIngredient);
    }
    this.onClear();
  }

  onClear(): void {
    this.shoppingListForm.reset();
    this.editMode = false;
  }

  onDelete(): void {
    this.shopingListService.deleteIngredient(this.itemIndex);
    this.onClear();
  }

  ngOnDestroy(): void {
    this.$unsubSubject.next();
    this.$unsubSubject.complete();
  }

}

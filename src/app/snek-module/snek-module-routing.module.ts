import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SnekModuleComponent } from './snek-module.component';

const routes: Routes = [{ path: '', component: SnekModuleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SnekModuleRoutingModule { }

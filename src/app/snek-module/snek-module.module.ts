import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SnekModuleRoutingModule } from './snek-module-routing.module';
import { SnekModuleComponent } from './snek-module.component';


@NgModule({
  declarations: [
    SnekModuleComponent
  ],
  imports: [
    CommonModule,
    SnekModuleRoutingModule
  ]
})
export class SnekModuleModule { }

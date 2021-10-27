import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestUpdateComponent } from './test-update/test-update.component';

const routes: Routes = [
  { path:'', component:TestUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

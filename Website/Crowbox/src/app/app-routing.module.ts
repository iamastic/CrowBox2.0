import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



import { DataComponent } from './data/data/data.component';
import { AuthComponent } from './home/auth/auth.component';

const routes: Routes = [
  { path:'', redirectTo:'/auth', pathMatch:'full' },
  { path:'data', component:DataComponent },
  { path:'auth', component:AuthComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

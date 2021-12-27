import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard'

import { DataComponent } from './data/data/data.component';
import { PrivateComponent } from './data/private/private.component';
import { HomeComponent } from './home/home/home.component';
import { ProfileComponent } from './Profile/profile/profile.component';
import { TroubleshootComponent } from './TroubleShoot/troubleshoot/troubleshoot.component';
import { SignupComponent } from './home/signup/signup.component';
import { LoginComponent } from './home/login/login.component';
import { PublicComponent } from './public/public/public.component';

const routes: Routes = [
  { path:'', redirectTo:'/home', pathMatch:'full' },
  { path:'home', component:HomeComponent},
  { path:'signup', component:SignupComponent },
  { path:'login', component:LoginComponent },
  { path:'public', component: PublicComponent },
  { path:'data', component:PrivateComponent, canActivate: [AngularFireAuthGuard] },
  { path:'troubleshoot', component:TroubleshootComponent, canActivate: [AngularFireAuthGuard] },
  { path:'profile', component:ProfileComponent, canActivate: [AngularFireAuthGuard] },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

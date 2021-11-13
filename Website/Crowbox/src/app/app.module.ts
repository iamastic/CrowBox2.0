import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//firebase related imports
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';


//to be deleted
import { TestUpdateComponent } from './test-update/test-update.component';
import { AuthComponentComponent } from './auth-component/auth-component.component';
import { SharedService } from './services/shared.service';

//for charts
import {ChartsModule} from 'ng2-charts';

//new components
import { AuthComponent } from './home/auth/auth.component';
import { InfoboxComponent } from './home/infobox/infobox.component';
import { HomeComponent } from './home/home/home.component';
import { DataComponent } from './data/data/data.component';
import { HandleAuthService } from './services/shared/handle-auth.service';
import { HeaderComponent } from './header/header.component';
import { TroubleshootComponent } from './TroubleShoot/troubleshoot/troubleshoot.component';
import { ProfileComponent } from './Profile/profile/profile.component';
import { InformationComponent } from './data/information/information.component';
import { EditInfoComponent, EditLocationComponent } from './Profile/edit-info/edit-info.component';
import { ProfileboxComponent } from './Profile/profilebox/profilebox.component';
import { PictureComponent } from './Profile/picture/picture.component';

//styling module
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


//Angular materials and forms
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatDialogModule} from '@angular/material/dialog';
import { MatButtonModule} from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon'


import { FormsModule } from '@angular/forms';




@NgModule({
  declarations: [
    AppComponent,
    TestUpdateComponent,
    AuthComponentComponent,
    AuthComponent,
    InfoboxComponent,
    HomeComponent,
    DataComponent,
    HeaderComponent,
    TroubleshootComponent,
    ProfileComponent,
    InformationComponent,
    EditInfoComponent,
    ProfileboxComponent,
    EditLocationComponent,
    PictureComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    ChartsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    AngularFireStorageModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule,

  ],
  providers: [HandleAuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

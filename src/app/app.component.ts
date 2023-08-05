import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
//  import { SplashScreen } from '@ionic-native/splash-screen/ngx';
//  import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FirebaseauthService } from './services/firebaseauth.service';
import { NotificationsService } from './services/notifications.service';

import { Plugins, StatusBarStyle } from '@capacitor/core';
//
const {share} = Plugins;
import { Share } from '@capacitor/core';
 const { SplashScreen, StatusBar } = Plugins;


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  admin = false;

  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private firebaseauthService: FirebaseauthService,
    private notificationsService: NotificationsService) {
    this.initializeApp();
  }

  initializeApp() {
    if(this.platform.is('capacitor')){
      this.platform.ready().then(() => {
  
        SplashScreen.hide();
          StatusBar.setBackgroundColor({color: '#ffffff'});
          StatusBar.setStyle({
            style: StatusBarStyle.Light 
      });
      //  this.statusBar.styleDefault();
      //     this.splashScreen.hide();
      
     

      });
  }
  this.getUid();
  }


  
  getUid() {
      this.firebaseauthService.stateAuth().subscribe( res => {
            if (res !== null) {
                if (res.uid === 'XCOqCU6bQTX1UzX5LEghdyfXVd23')  {
                    this.admin = true;
                } else {
                   this.admin = false;
                }
            } else {
              this.admin = false;
            }
      });
  }

  compartirApp(){
     Share.share({
      title: 'App Ponceca Tortas',
      text: '¡Descarga mi increíble aplicación!',
      url: 'https://apptortasandahuaylas.web.app/',
      dialogTitle: 'Share with buddies',
    });
  }
}






//   match /Productos/{documents=**} {
//     allow read;
//     allow write: if request.auth.uid == 'p9h09mCbbTOc6AsqBoIUdH0gTx93'
// }

// match /Clientes/{userId}/pedidos/{documents=**} {
// allow read;
// allow write: if request.auth.uid == userId
// }


//   rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read, write: if
//           request.time < timestamp.date(2020, 12, 28);
//     }
//   }
// }

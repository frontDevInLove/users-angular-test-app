import { Component } from '@angular/core';
import { UsersPageComponent } from './pages/users-page/users-page.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [UsersPageComponent]
})
export class AppComponent {
}

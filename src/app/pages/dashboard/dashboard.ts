import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService} from '../../services/crud.service.js';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit{
items: any[] = [];
name: string = '';
  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private crud:CrudService,

  ) {}

  add(){
    const user = this.auth.currentUser;
    if(!user){
      alert("Please login first");
      return;
    }
    this.crud.addData({
      name:this.name,
      uid: user.uid,
      created:Date.now()
    });
    this.name = '';
  }
  
  // READ
  ngOnInit() {

    const user = this.auth.currentUser;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.crud.getUserData(user.uid).subscribe((res: any) => {
      this.items = res;
    });

  }
  // UPDATE
  update(id:any){
    this.crud.updateData(id,{
      name:this.name
    });
  }
  
  // DELETE
  delete(id:any){
    this.crud.deleteData(id);
  }

  logout() {

    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  
  }
  
}

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AppConfig } from './app.config';
import {FormControl} from '@angular/forms';
import {AppService} from './app.service';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'UBTech-CLient';
  
  usersForm: FormGroup;
  txtSearch = new FormControl();
  butSubmit = new FormControl();
  txtSearchAutoComplete = new FormControl();
  filteredOptions: any;
  selectedUser = null;

  subscription1: Subscription = null;
  subscription2: Subscription = null;
    
  constructor(private _httpService:AppService, private fb: FormBuilder, public dialog: MatDialog) {
    this.selectedUser = null;
  }

  ngOnInit() {
    this.usersForm = this.fb.group({
      txtSearch: null
    })
    
    this.subscription1 = this.usersForm.get('txtSearch').valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(val => {
      if (val && val.length >= 2) {
        this.subscription2 = this._httpService.getMethod(AppConfig.settings.env + 'api/Students/GetSearchString/' + encodeURIComponent(val))
        .subscribe (
          data => {
            this.filteredOptions = data;
          },
          error => {
            
          }
        );
      } 
    });
  }

  displayFn(user: any) {
    if (user) { 
      return user.FirstName + ' ' + user.LastName; 
    }
  }

  onSelectedUser() {
    this.selectedUser = this.usersForm.controls.txtSearch.value;
  }

  itemClicked() {
    const dialogRef = this.dialog.open(StudentDetailDialogComponent, {
      width: '300px',
      data: this.selectedUser
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  inputClick() {
    this.selectedUser = null;
  }

  ngOnDestroy() { 
    if (this.subscription1) {
      this.subscription1.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }
}

@Component({
  selector: 'app-student-detail-dialog',
  templateUrl: './student-detail-dialog/student-detail-dialog.component.html',
  styleUrls: ['./student-detail-dialog/student-detail-dialog.component.css']
})
export class StudentDetailDialogComponent implements OnInit {
  selectedUser: any;

  constructor(public dialogRef: MatDialogRef<AppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log(data);
      this.selectedUser = data;
    }

  ngOnInit() {
  }

  CloseDialog() : void {
    this.dialogRef.close();
  }
}
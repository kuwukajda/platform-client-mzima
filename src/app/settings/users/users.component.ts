import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RoleResponse, UserResult } from '@models';
import { RolesService, UsersService } from '@services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['select', 'avatar', 'realname', 'email', 'role'];
  dataSource: MatTableDataSource<UserResult>;
  selection = new SelectionModel<UserResult>(true, []);

  public roleResponse$: Observable<RoleResponse>;
  selectedValue: string;

  constructor(
    private userService: UsersService, //
    private rolesService: RolesService,
  ) {}

  public ngOnInit() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource<UserResult>(response.results);
        this.dataSource.paginator = this.paginator;
      },
    });
    this.roleResponse$ = this.rolesService.get();
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  public apply() {
    console.log(this.selectedValue);
    console.log(this.selection.selected);
  }
}

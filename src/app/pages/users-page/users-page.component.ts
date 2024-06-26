import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  takeUntil,
  firstValueFrom,
  switchMap,
  filter,
} from 'rxjs';
import { ListRequest, UserDto } from 'src/app/api/users.api';
import { PaginationComponent } from 'src/app/components/pagination/pagination.component';
import { UsersListComponent } from 'src/app/components/users-list/users-list.component';
import { ViewKind } from 'src/app/enums/view-kind';
import { UsersService } from 'src/app/services/users-service';
import { RequestPagingData } from 'src/app/types/request-paging-data';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    UsersListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent implements OnInit, OnDestroy {
  /** вид отображения пользователей */
  public viewKind: ViewKind = ViewKind.LIST;

  /** радио-инпуты для изменения отображения */
  public viewControl = new FormControl(ViewKind.LIST);

  /** поле поиска */
  public searchControl = new FormControl('');

  /** вид отображения пользователей */
  public readonly ViewKind: typeof ViewKind = ViewKind;

  /** отображаемы на странице пользователи */
  public filteredUsers: UserDto[] = [];

  /** флаг загрузки */
  public loading = false;

  public loading$ = this.usersService.loading$;

  /** общее количество пользователей */
  public total = 0;

  /** данные пагинации запроса, данные из которого отображаются на странице */
  public lastFetchedPaginationData: RequestPagingData = {
    pageNumber: 1,
    itemsPerPage: 5,
  };

  /** подписка на отписку */
  private unsubscribe$ = new Subject<void>();

  public constructor(
    private usersService: UsersService,
    private cd: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    /** подписка на изменение вида отображения данных */
    this.viewControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((value): value is ViewKind => !!value),
      )
      .subscribe((value) => {
        this.viewKind = value;
        this.cd.detectChanges();
      });

    /** подписка на получение пользователей */
    firstValueFrom(this.fetchUsers(this.lastFetchedPaginationData));

    /** подписка получение новых данных в случае ввода текста в поле поиска */
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.unsubscribe$),
        switchMap((search) =>
          this.fetchUsers({
            pageNumber: 1,
            itemsPerPage: this.lastFetchedPaginationData.itemsPerPage,
            search: search ?? '',
          }),
        ),
      )
      .subscribe();

    this.usersService.userListData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.total = data.total_count;
        this.filteredUsers = data.items;
        this.lastFetchedPaginationData = {
          pageNumber: data.pageNumber,
          itemsPerPage: data.itemsPerPage,
        };
        this.cd.detectChanges();
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Обработка изменения данных пагинации (смена страницы, выбор количества элементов на странице)
   * @param {RequestPagingData} event - новые данные пагинации для запроса
   */
  public async onChangePagination(event: RequestPagingData) {
    await firstValueFrom(
      this.fetchUsers({
        ...event,
        search: this.searchControl.getRawValue() ?? '',
      }),
    );
  }

  /**
   * Получение пользователей
   * @param {ListRequest} payload - данные для запроса на получение пользователей
   */
  private fetchUsers(payload: ListRequest) {
    return this.usersService
      .fetchUsers(payload)
      .pipe(takeUntil(this.unsubscribe$));
  }
}

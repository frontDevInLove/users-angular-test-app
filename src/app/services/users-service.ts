import { Injectable } from '@angular/core';
import { ListRequest, UserListResponseDto, UsersApi } from '../api/users.api';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  of,
  tap,
  firstValueFrom,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /**
   * Данные списка пользователей.
   */
  private userListData$$ = new BehaviorSubject<
    UserListResponseDto & ListRequest
  >({
    total_count: 0,
    items: [],
    search: '',
    itemsPerPage: 5,
    pageNumber: 1,
  });

  /**
   * Флаг загрузки данных.
   */
  private loading$$ = new BehaviorSubject<boolean>(false);

  /** Параметры для запроса в статусе ожидания ответа */
  private ongoingRequestParams: null | ListRequest = null;

  public constructor(private usersApi: UsersApi) {}

  /**
   * Получение данных списка пользователей.
   */
  public get userListData$() {
    return this.userListData$$.asObservable();
  }

  /**
   * Получение состояния загрузки данных.
   */
  public get loading$() {
    return this.loading$$.asObservable();
  }

  /**
   * Получение пользователей
   * @param {ListRequest} payload - данные для запроса на получение пользователей
   */
  public fetchUsers(
    payload: ListRequest,
  ): Observable<UserListResponseDto | null> {
    this.loading$$.next(true);
    this.ongoingRequestParams = payload;

    return this.usersApi.getList(payload).pipe(
      tap((data) => {
        this.userListData$$.next({ ...data, ...payload });
      }),
      catchError(() => {
        this.userListData$$.next({
          total_count: 0,
          items: [],
          search: '',
          itemsPerPage: 5,
          pageNumber: 1,
        });

        return of(null);
      }),
      finalize(() => {
        this.loading$$.next(false);
        this.ongoingRequestParams = null;
      }),
    );
  }

  /**
   * Удаление пользователя
   * @param {string} id - id удаляемого пользователя
   */
  public async deleteUser(id: string) {
    // возвращение loading к false происходит в fetchUsers
    this.loading$$.next(true);
    await firstValueFrom(this.usersApi.remove(id));

    const paramsSource = this.ongoingRequestParams ?? this.userListData$$.value;

    const { items } = this.userListData$$.value;

    const { pageNumber, itemsPerPage, search } = paramsSource;
    const isDeletingUserLastOnPage = items.length === 1;
    const newPageNumber =
      isDeletingUserLastOnPage && pageNumber > 1 ? pageNumber - 1 : pageNumber;

    await firstValueFrom(
      this.fetchUsers({
        itemsPerPage,
        pageNumber: newPageNumber,
        search: search ?? '',
      }),
    );
  }
}

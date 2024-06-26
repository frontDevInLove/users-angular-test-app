import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ItemsPerPage,
  RequestPagingData,
} from 'src/app/types/request-paging-data';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnInit, OnDestroy {
  /** номер текущей страницы */
  @Input()
  public currentPage = 1;

  /** количество записей на всех страницах */
  private _total = 0;

  @Input()
  public get total(): number {
    return this._total;
  }

  public set total(value: number) {
    this._total = value;
    this.setPages();
  }

  @Output()
  public pagingChanged = new EventEmitter<RequestPagingData>();

  /** селект с вариантами размера страницы запроса */
  public perPageControl = new FormControl<ItemsPerPage>(5);

  /** массив с номерами страниц */
  public pages: number[] = [];

  /** варианты размера страниц */
  public perPageOptions: ItemsPerPage[] = [5, 10, 20];

  /** подписка на отписку от наблюдения  */
  private unsubscribe$ = new Subject<void>();

  public constructor(private cd: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.perPageControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((itemsPerPage) => {
        if (!itemsPerPage) return;

        this.pagingChanged.emit({ pageNumber: 1, itemsPerPage });
        this.setPages();
        this.cd.detectChanges();
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Выбор новой страницы
   * @param {number} pageNumber - номер новой страницы
   */
  public onPageClick(pageNumber: number) {
    if (this.currentPage === pageNumber) {
      return;
    }
    this.currentPage = pageNumber;

    this.pagingChanged.emit({
      pageNumber,
      itemsPerPage: this.perPageControl.getRawValue()!,
    });
  }

  /**
   * Функция для отслеживания изменений в массиве страниц.
   * @param index Индекс элемента.
   * @param page Номер страницы.
   * @returns Строковое представление номера страницы.
   */
  public trackByFn(index: number, page: number): string {
    return page.toString();
  }

  /**
   * установка массива с номерами страниц
   */
  private setPages() {
    const pagesCount = Math.ceil(
      this.total / this.perPageControl.getRawValue()!,
    );
    this.pages = [...Array(pagesCount).keys()].map((el) => el + 1);
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserDto } from 'src/app/api/users.api';
import { ViewKind } from 'src/app/enums/view-kind';
import { UserCardComponent } from '../user-card/user-card.component';
import { UserRowComponent } from '../user-list-row/user-row.component';
import { UsersService } from 'src/app/services/users-service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone: true,
  imports: [CommonModule, UserCardComponent, UserRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  /** Список пользователей для отображения. */
  @Input()
  public users: UserDto[] = [];

  /**
   * Режим отображения списка пользователей (список или карточки).
   */
  @Input()
  public viewKind: ViewKind = ViewKind.LIST;

  /** Константа для доступа к enum ViewKind из шаблона. */
  public readonly ViewKind: typeof ViewKind = ViewKind;

  public constructor(private usersService: UsersService) {}

  /**
   * Функция для отслеживания изменений в списке пользователей.
   * @param _index Индекс элемента.
   * @param user Пользователь.
   * @returns Идентификатор пользователя.
   */
  public trackByFn(_index: number, user: UserDto): string {
    return user.id;
  }

  /**
   * Метод для удаления пользователя
   * @param { string } id - id удаляемого пользователя
   */
  public async onRemoveClick(id: string) {
    await this.usersService.deleteUser(id);
  }
}

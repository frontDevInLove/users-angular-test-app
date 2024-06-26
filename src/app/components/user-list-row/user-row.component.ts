import { CommonModule } from "@angular/common"
import { Component, EventEmitter, Input, Output } from "@angular/core"
import { UserDto } from "src/app/api/users.api"

@Component({
  selector: 'app-user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class UserRowComponent {
  /**
   * Данные пользователя для отображения.
   */
  @Input()
  public item!: UserDto

  /**
   * Событие удаления пользователя.
   */
  @Output()
  public deleteClick = new EventEmitter<string>()

  /**
   * Обработка клика на удаление
   * @param { string } id - id удаляемого пользователя
   */
  public onRemoveClick(id: string) {
    this.deleteClick.emit(id);
  }
}
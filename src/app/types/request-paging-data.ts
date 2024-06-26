import { ListRequest } from '../api/users.api';

/** возможные размеры страниц  */
export type ItemsPerPage = ListRequest['itemsPerPage'];

/** данные для запроса на получение пользователей */
export type RequestPagingData = Omit<ListRequest, 'search'>;

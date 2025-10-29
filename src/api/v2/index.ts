import * as user from './user/user';
import * as tunnel from './tunnel/tunnel';
import * as node from './node/node';
import * as panel from './panel/panel';
import * as domain from './domain/domain';
import * as admin from './admin/admin';
import { ApiError } from './axios/axiosInstance';

export default {
    user,
    tunnel,
    node,
    panel,
    domain,
    admin,
    ApiError,
};

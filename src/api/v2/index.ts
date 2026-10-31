import * as user from './user/user';
import * as userViolation from './user/violation';
import * as tunnel from './tunnel/tunnel';
import * as node from './node/node';
import * as panel from './panel/panel';
import * as domain from './domain/domain';
import * as admin from './admin/admin';
import * as violation from './admin/violation';
import * as payment from './payment/payment';
import * as giftcard from './giftcard/giftcard';
import * as integral from './integral/integral';
import * as ssl from './ssl/ssl';
import * as whitelist from './whitelist/whitelist';
import { ApiError } from './axios/axiosInstance';

export default {
    user,
    userViolation,
    tunnel,
    node,
    panel,
    domain,
    admin,
    violation,
    payment,
    giftcard,
    integral,
    ssl,
    whitelist,
    ApiError,
};

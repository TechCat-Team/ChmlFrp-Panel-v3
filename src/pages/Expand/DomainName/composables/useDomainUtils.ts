import { SPECIAL_RECORD_MESSAGES } from '../constants';

/**
 * 域名工具函数 composable
 */
export function useDomainUtils() {
    const isSpecialRecord = (record: string): boolean => {
        return Object.keys(SPECIAL_RECORD_MESSAGES).some((key) => record.includes(key));
    };

    const getTooltipMessage = (record: string, domain: string): string => {
        const cleanedRecord = cleanRecord(record);
        const message = Object.keys(SPECIAL_RECORD_MESSAGES).find((key) => record.includes(key));

        return message
            ? `此域名通过SRV解析隐藏了${SPECIAL_RECORD_MESSAGES[message]}端口，可直接通过${cleanedRecord + '.' + domain}连接`
            : '';
    };

    const cleanRecord = (record: string): string => {
        const tcpIndex = record.indexOf('_tcp.');
        const udpIndex = record.indexOf('_udp.');

        let indexToRemove = -1;
        if (tcpIndex !== -1) {
            indexToRemove = tcpIndex + 5;
        } else if (udpIndex !== -1) {
            indexToRemove = udpIndex + 4;
        }

        if (indexToRemove !== -1) {
            return record.substring(indexToRemove);
        }

        return record;
    };

    return {
        isSpecialRecord,
        getTooltipMessage,
        cleanRecord,
    };
}


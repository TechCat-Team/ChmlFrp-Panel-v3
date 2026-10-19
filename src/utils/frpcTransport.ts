export type ConnectionProtocol = 'tcp' | 'quic';

export type ConfigFormat = 'ini' | 'toml';

export const configFormatOptions = [
    { label: 'TOML（默认）', value: 'toml' },
    { label: 'INI', value: 'ini' },
];

export function connectionProtocolOptions(quicAvailable: boolean) {
    return [
        { label: 'TCP（默认）', value: 'tcp' },
        { label: quicAvailable ? 'QUIC' : 'QUIC（节点未启用）', value: 'quic', disabled: !quicAvailable },
    ];
}

export function frpcStartCommand(
    token: string | undefined,
    tunnelIds: Array<string | number>,
    protocol: ConnectionProtocol,
    platform: 'windows' | 'unix' = 'windows'
): string {
    if (!token || tunnelIds.length === 0) return '';
    const command = `${platform === 'windows' ? 'frpc.exe' : './frpc'} -u ${token} -p ${tunnelIds.join(',')}${protocol === 'quic' ? ' --protocol quic' : ''}`;
    return platform === 'unix' ? `chmod +x frpc && ${command}` : command;
}

const fs = require('fs').promises;
const path = require('path');

const type = process.argv[2] || 'patch';
const pkgPath = path.resolve(__dirname, 'package.json');

function bumpVersion(version, type) {
    let [major, minor, patch] = version.split('.').map(Number);
    switch (type) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
        default:
            if (patch < 9) {
                patch++;
            } else {
                patch = 0;
                minor++;
            }
            break;
    }
    return `${major}.${minor}.${patch}`;
}

async function main() {
    try {
        const data = await fs.readFile(pkgPath, 'utf8');
        const pkg = JSON.parse(data);
        const oldVersion = pkg.version;
        const newVersion = bumpVersion(oldVersion, type);
        pkg.version = newVersion;
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`版本已从 ${oldVersion} 升级为 ${newVersion}`);
    } catch (err) {
        console.error('处理 package.json 时出错:', err.message);
        process.exit(1);
    }
}

main();

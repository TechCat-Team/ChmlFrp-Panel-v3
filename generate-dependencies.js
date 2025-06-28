import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function generateDependencies() {
    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const packageJsonData = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonData);

    // 获取北京时间（中国标准时间，CST）
    const now = new Date();
    const options = {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const buildTime = now.toLocaleString('zh-CN', options);

    const dependencies = {
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        version: packageJson.version,
        buildTime: buildTime,
    };

    const outputPath = path.resolve(__dirname, 'public', 'dependencies.json');
    fs.writeFileSync(outputPath, JSON.stringify(dependencies, null, 2));

    console.log('已成功生成依赖项等面板信息。');
}

generateDependencies();

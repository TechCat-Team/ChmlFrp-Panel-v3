const fs = require('fs');
const path = require('path');

function generateDependencies() {
    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const packageJsonData = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonData);

    const now = new Date();
    const buildTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const dependencies = {
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        buildTime: buildTime
    };

    const outputPath = path.resolve(__dirname, 'public', 'dependencies.json');
    fs.writeFileSync(outputPath, JSON.stringify(dependencies, null, 2));

    console.log('已成功生成依赖项等面板信息文件。');
}

generateDependencies();
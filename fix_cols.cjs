const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(filePath + ' updated');
}

replaceInFile('src/services/members.service.ts', [
    { from: /plan_id/g, to: 'membership_plan_id' },
    { from: /start_date/g, to: 'join_date' },
    { from: /end_date/g, to: 'expiry_date' }
]);

replaceInFile('src/services/dashboard.service.ts', [
    { from: /plan_id/g, to: 'membership_plan_id' },
    { from: /start_date/g, to: 'join_date' },
    { from: /end_date/g, to: 'expiry_date' }
]);

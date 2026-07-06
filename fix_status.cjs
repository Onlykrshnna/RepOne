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

replaceInFile('src/services/payment.service.ts', [
    { from: /'approved'/g, to: "'completed'" },
    { from: /status === 'approved'/g, to: "status === 'completed'" },
    { from: /\.eq\('status', 'approved'\)/g, to: ".eq('status', 'completed')" }
]);

replaceInFile('src/routes/admin.membership-requests.tsx', [
    { from: /'approved'/g, to: "'completed'" },
    { from: /status === 'approved'/g, to: "status === 'completed'" }
]);

replaceInFile('src/services/members.service.ts', [
    { from: /'approved'/g, to: "'completed'" }
]);

replaceInFile('src/services/dashboard.service.ts', [
    { from: /'approved'/g, to: "'completed'" }
]);

console.log("Status standardized to 'completed'");

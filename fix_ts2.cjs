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

replaceInFile('src/routes/_member.buy-membership.tsx', [
    { from: /member_memberships/g, to: 'members' }
]);

replaceInFile('src/routes/admin.members.tsx', [
    { from: /member_memberships/g, to: 'members' }
]);

replaceInFile('src/routes/admin.members.$memberId.tsx', [
    { from: /member_memberships/g, to: 'members' }
]);

replaceInFile('src/lib/auth-context.tsx', [
    { from: /member_memberships/g, to: 'members' }
]);

replaceInFile('src/services/payment.service.ts', [
    { from: /member_memberships/g, to: 'members' },
    { from: /savePayments\(MOCK_PAYMENTS\);/g, to: '' },
    { from: /p.profile_id === memberId/g, to: 'p.profile_id === profileId' }
]);

console.log("Typescript fixes applied");

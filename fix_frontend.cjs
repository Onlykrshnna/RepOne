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
    { from: /member_id: profile!\.id,/g, to: 'profile_id: profile!.id,' }
]);

replaceInFile('src/routes/admin.membership-requests.tsx', [
    { from: /memberId: selectedPayment\.member_id,/g, to: 'profileId: selectedPayment.profile_id,' },
    { from: /payment\.member_id/g, to: 'payment.profile_id' }
]);

// Wait, the RPC changed, check members.service.ts
replaceInFile('src/services/members.service.ts', [
    { from: /member_memberships/g, to: 'members' }
]);

// dashboard.service.ts
replaceInFile('src/services/dashboard.service.ts', [
    { from: /member_memberships/g, to: 'members' }
]);

// Ensure dashboard still works: in members, it joins members as `members ( ... )` instead of `member_memberships`.
// Wait, `member?.member_memberships?.[0]` becomes `member?.members?.[0]`.
replaceInFile('src/services/dashboard.service.ts', [
    { from: /member\?\.member_memberships\?/g, to: 'member?.members?' }
]);
replaceInFile('src/services/members.service.ts', [
    { from: /m\.member_memberships/g, to: 'm.members' },
    { from: /member_memberships:/g, to: 'members:' }
]);

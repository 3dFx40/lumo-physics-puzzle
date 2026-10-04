# חתימת Git

הקומיט והטאג של גרסה זו חתומים ב־SSH באמצעות מפתח Ed25519 ייעודי לפרויקט. רק המפתח הציבורי מתפרסם במאגר. המפתח הפרטי נשאר מקומית ב־`.tools/signing/commit-ed25519` ואינו נכלל ב־Git או בקובצי ההפצה.

בדיקת חתימה לאחר Clone:

```sh
git -c gpg.ssh.allowedSignersFile=docs/signing/allowed_signers verify-commit HEAD
git -c gpg.ssh.allowedSignersFile=docs/signing/allowed_signers verify-tag v1.0.0
```

זו חתימה הניתנת לאימות באמצעות המפתח הציבורי המצורף. תג Verified של GitHub דורש בנוסף רישום המפתח הציבורי בחשבון GitHub כמפתח חתימה. המפתח אינו משמש לגישה למאגר דרך SSH.

ה־APK חתום בנפרד באמצעות מפתח הפיתוח של Android. מפתח זה שונה ממפתח החתימה של Git.

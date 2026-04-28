# Build APK Skill
Trigger: /apk
Steps:
1. npm run cap:sync
2. cd android && ./gradlew assembleDebug
3. Confirm the APK at `android/app/build/outputs/apk/debug/app-debug.apk`

Release builds require signing configuration before using `assembleRelease`.

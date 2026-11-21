# صدى شات

مشروع تطبيق اجتماعي عربي للغرف الصوتية والمحادثات والمتجر والمحفظة والهدايا وعضويات VIP، مع لوحة إدارة تعتمد على صلاحيات الخادم.

## مكونات المستودع
- `src/`: تطبيق الويب/المعاينة، مسارات التطبيق ولوحة الإدارة.
- `supabase/`: إعدادات Supabase وSQL migrations وEdge Functions.
- `native-android/`: مشروع Android أصلي مبني بـ Kotlin وJetpack Compose.
- `public/control-center/`: واجهة مركز التحكم المساندة.
- `src/assets/3d/`: أصول ورسومات الواجهات.

## التشغيل المحلي
يتطلب Node.js وBun وإعداد `VITE_SUPABASE_URL` و`VITE_SUPABASE_PUBLISHABLE_KEY` و`SUPABASE_URL` و`SUPABASE_PUBLISHABLE_KEY` محلياً.
```bash
bun install
bun run dev
```

## Android الأصلي
يتطلب JDK 17 وAndroid SDK 36 وGradle 8.13. وفر `SUPABASE_URL` و`SUPABASE_PUBLISHABLE_KEY` عبر بيئة البناء أو Gradle properties، ثم:
```bash
cd native-android
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```
يُنشأ APK في `native-android/app/build/outputs/apk/debug/`.

## Supabase والأمان
- استخدم مفتاح النشر العام فقط في تطبيقات العميل.
- لا تضع `service_role` أو أسرار Agora أو مفاتيح OAuth في المستودع أو APK.
- ملفات `supabase/migrations` محفوظة للمراجعة؛ لا تُشغّلها تلقائياً على قاعدة الإنتاج. راجع توافق كل migration مع المخطط الحالي وسياسات RLS والبيانات قبل تطبيقها.
- فعّل Google OAuth وSMS Provider وRedirect URLs من إعدادات Supabase، وأضف أسرار RTC في إعدادات Edge Functions.

## لوحة الإدارة
مسار لوحة الإدارة داخل التطبيق هو `/admin`. الوصول يعتمد على جلسة المستخدم وصلاحيات الإدارة التي يتحقق منها Supabase. يجب إنشاء/تعيين حساب مدير من خلال آلية آمنة في قاعدة البيانات، ولا تمنح صلاحيات الإدارة من الواجهة.

وجود الملفات لا يعني نجاح البناء أو جاهزية كل خدمة إنتاجية؛ يجب تشغيل اختبارات الويب وAndroid، والتحقق من إعدادات مزودي المصادقة والصوت، ومراجعة توافق migrations مع قاعدة البيانات الفعلية.

package com.voxroyale.nativeapp

import android.os.Bundle
import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import io.github.jan.supabase.auth.handleDeeplinks
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.OTP
import io.github.jan.supabase.auth.OtpType
import io.github.jan.supabase.auth.status.SessionStatus
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Ink = Color(0xFFF5F6FA)
private val SurfaceWhite = Color.White
private val Brand = Color(0xFF3478F6)
private val TextMain = Color(0xFF202638)
private val TextMuted = Color(0xFF8991A3)
private val Line = Color(0xFFE9ECF2)

internal enum class Destination(val label: String) {
    Chats("الرسائل"), Rooms("الغرف"), Discover("اكتشف"), Moments("اللحظات"), Me("أنا")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (SupabaseRuntimeConfig.isConfigured) NativeSupabase.client.handleDeeplinks(intent)
        setContent { VoxRoyaleApp() }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (SupabaseRuntimeConfig.isConfigured) NativeSupabase.client.handleDeeplinks(intent)
    }
}

@Composable
private fun VoxRoyaleApp() {
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var authenticated by remember { mutableStateOf(false) }
    var initializing by remember { mutableStateOf(SupabaseRuntimeConfig.isConfigured) }

    fun showNotice(message: String) {
        scope.launch {
            val noticeJob = launch {
                snackbarHostState.showSnackbar(message, duration = SnackbarDuration.Indefinite)
            }
            delay(2000)
            snackbarHostState.currentSnackbarData?.dismiss()
            noticeJob.cancel()
        }
    }

    LaunchedEffect(SupabaseRuntimeConfig.isConfigured) {
        if (!SupabaseRuntimeConfig.isConfigured) {
            initializing = false
            authenticated = false
            return@LaunchedEffect
        }
        NativeSupabase.client.auth.sessionStatus.collect { status ->
            initializing = status == SessionStatus.Initializing
            authenticated = status is SessionStatus.Authenticated
        }
    }

    when {
        !SupabaseRuntimeConfig.isConfigured -> SupabaseSetupScreen()
        initializing -> NativeLoadingScreen()
        !authenticated -> NativeAuthScreen(snackbarHostState, ::showNotice)
        else -> MainAppContent(
            snackbarHostState = snackbarHostState,
            onSignOut = {
                scope.launch {
                    try {
                        NativeSupabase.client.auth.signOut()
                        showNotice("تم تسجيل الخروج")
                    } catch (error: Exception) {
                        showNotice(error.message ?: "تعذر تسجيل الخروج")
                    }
                }
            }
        )
    }
}

@Composable
private fun NativeLoadingScreen() {
    MaterialTheme(colorScheme = lightColorScheme(primary = Brand, background = Ink)) {
        Box(Modifier.fillMaxSize().background(Ink), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = Brand)
                Spacer(Modifier.height(14.dp))
                Text("جارٍ تجهيز حسابك...", color = TextMain, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun SupabaseSetupScreen() {
    MaterialTheme(colorScheme = lightColorScheme(primary = Brand, background = Ink)) {
        Box(Modifier.fillMaxSize().background(Ink).padding(24.dp), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.CloudOff, null, tint = Brand, modifier = Modifier.size(54.dp))
                Spacer(Modifier.height(16.dp))
                Text("تعذر إعداد الاتصال", color = TextMain, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text(
                    "يلزم توفير عنوان Supabase ومفتاح النشر العام في إعدادات بناء Android.",
                    color = TextMuted,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

@Composable
private fun NativeAuthScreen(
    snackbarHostState: SnackbarHostState,
    onNotice: (String) -> Unit
) {
    var phone by remember { mutableStateOf("+20") }
    var otp by remember { mutableStateOf("") }
    var otpSent by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val phoneNumber = phone.trim()
    val validPhone = Regex("^\\+[1-9]\\d{7,14}$").matches(phoneNumber)

    MaterialTheme(colorScheme = lightColorScheme(primary = Brand, background = Ink)) {
        Scaffold(
            snackbarHost = { StyledSnackbarHost(snackbarHostState) },
            containerColor = Ink
        ) { padding ->
            Column(
                Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("VOX ROYALE", color = Brand, fontSize = 29.sp, fontWeight = FontWeight.Black, letterSpacing = 1.5.sp)
                Spacer(Modifier.height(8.dp))
                Text("مرحبًا بك في مجتمعك الصوتي", color = TextMuted, fontSize = 14.sp)
                Spacer(Modifier.height(30.dp))
                Surface(color = SurfaceWhite, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(20.dp)) {
                        Text("تسجيل الدخول", color = TextMain, fontSize = 21.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(7.dp))
                        Text("استخدم رقم هاتفك أو حساب Google للمتابعة.", color = TextMuted, fontSize = 12.sp)
                        Spacer(Modifier.height(18.dp))
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !busy && !otpSent,
                            singleLine = true,
                            label = { Text("رقم الهاتف بالصيغة الدولية") },
                            placeholder = { Text("+2010xxxxxxxx") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                        )
                        if (otpSent) {
                            Spacer(Modifier.height(12.dp))
                            OutlinedTextField(
                                value = otp,
                                onValueChange = { otp = it.filter(Char::isDigit).take(6) },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = !busy,
                                singleLine = true,
                                label = { Text("رمز التحقق") },
                                placeholder = { Text("أدخل الرمز المكوّن من 6 أرقام") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )
                        }
                        Spacer(Modifier.height(14.dp))
                        Button(
                            onClick = {
                                scope.launch {
                                    busy = true
                                    try {
                                        if (!otpSent) {
                                            NativeSupabase.client.auth.signInWith(OTP) { this.phone = phoneNumber }
                                            otpSent = true
                                            onNotice("تم إرسال رمز التحقق إلى هاتفك")
                                        } else {
                                            NativeSupabase.client.auth.verifyPhoneOtp(
                                                type = OtpType.Phone.SMS,
                                                phone = phoneNumber,
                                                token = otp.trim()
                                            )
                                            onNotice("تم التحقق من رقم الهاتف")
                                        }
                                    } catch (error: Exception) {
                                        onNotice(error.message ?: "تعذر إكمال تسجيل الدخول")
                                    } finally {
                                        busy = false
                                    }
                                }
                            },
                            enabled = !busy && (if (otpSent) otp.length == 6 else validPhone),
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            if (busy) CircularProgressIndicator(Modifier.size(19.dp), color = Color.White, strokeWidth = 2.dp)
                            else Text(if (otpSent) "تأكيد الرمز" else "إرسال رمز SMS")
                        }
                        if (otpSent) {
                            TextButton(
                                onClick = { otpSent = false; otp = "" },
                                enabled = !busy,
                                modifier = Modifier.align(Alignment.CenterHorizontally)
                            ) { Text("تغيير رقم الهاتف") }
                        }
                        Spacer(Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = {
                                scope.launch {
                                    busy = true
                                    try {
                                        NativeSupabase.client.auth.signInWith(Google)
                                        onNotice("جارٍ فتح تسجيل الدخول باستخدام Google")
                                    } catch (error: Exception) {
                                        onNotice(error.message ?: "تعذر بدء تسجيل Google")
                                        busy = false
                                    }
                                }
                            },
                            enabled = !busy,
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Text("المتابعة باستخدام Google", color = TextMain, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
                Spacer(Modifier.height(18.dp))
                Text("تتم حماية جلسة الدخول وإدارتها عبر Supabase.", color = TextMuted, fontSize = 11.sp, textAlign = TextAlign.Center)
            }
        }
    }
}

@Composable
private fun StyledSnackbarHost(hostState: SnackbarHostState) {
    SnackbarHost(hostState = hostState) { data ->
        Box(
            Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(Brush.horizontalGradient(listOf(Color(0xE61D4ED8), Color(0xE65B21B6))))
                .border(1.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(18.dp))
                .padding(horizontal = 18.dp, vertical = 13.dp)
        ) {
            Text(data.visuals.message, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
        }
    }
}

@Composable
private fun MainAppContent(
    onSignOut: () -> Unit,
    snackbarHostState: SnackbarHostState
) {
    var destination by remember { mutableStateOf(Destination.Discover) }
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Brand,
            background = Ink,
            surface = SurfaceWhite,
            onPrimary = Color.White,
            onBackground = TextMain,
            onSurface = TextMain
        )
    ) {
        Scaffold(
            snackbarHost = { StyledSnackbarHost(snackbarHostState) },
            containerColor = Ink,
            bottomBar = {
                NavigationBar(containerColor = SurfaceWhite, tonalElevation = 8.dp) {
                    Destination.values().forEach { item ->
                        val icon = when (item) {
                            Destination.Chats -> Icons.Default.ChatBubbleOutline
                            Destination.Rooms -> Icons.Default.Mic
                            Destination.Discover -> Icons.Default.Explore
                            Destination.Moments -> Icons.Default.DynamicFeed
                            Destination.Me -> Icons.Default.PersonOutline
                        }
                        NavigationBarItem(
                            selected = destination == item,
                            onClick = { destination = item },
                            icon = { Icon(icon, contentDescription = item.label) },
                            label = { Text(item.label, fontSize = 10.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Brand,
                                selectedTextColor = Brand,
                                indicatorColor = Color(0xFFEAF1FF),
                                unselectedIconColor = TextMuted,
                                unselectedTextColor = TextMuted
                            )
                        )
                    }
                }
            }
        ) { padding ->
            when (destination) {
                Destination.Discover -> DiscoverScreen(Modifier.padding(padding), onRooms = { destination = Destination.Rooms })
                Destination.Rooms -> RoomsScreen(Modifier.padding(padding))
                Destination.Chats -> ChatsScreen(Modifier.padding(padding))
                Destination.Moments -> MomentsScreen(Modifier.padding(padding))
                Destination.Me -> ProfileScreen(Modifier.padding(padding), onSignOut)
            }
        }
    }
}

@Composable
private fun DiscoverScreen(modifier: Modifier = Modifier, onRooms: () -> Unit) {
    LazyColumn(modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        item {
            Row(Modifier.fillMaxWidth().padding(top = 18.dp, bottom = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("VOX ROYALE", color = Brand, fontSize = 21.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    Text("تواصل، شارك، واكتشف", color = TextMuted, fontSize = 11.sp)
                }
                IconButton(onClick = {}) { Icon(Icons.Default.Search, "بحث", tint = TextMain) }
                IconButton(onClick = {}) { Icon(Icons.Default.NotificationsNone, "الإشعارات", tint = TextMain) }
            }
        }
        item {
            Surface(color = Color(0xFFEAF1FF), shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("مساحتك للتواصل", color = TextMain, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(5.dp))
                        Text("انضم إلى محادثة صوتية أو تواصل مع أصدقائك", color = TextMuted, fontSize = 12.sp)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onRooms, shape = RoundedCornerShape(12.dp)) {
                            Icon(Icons.Default.Mic, null, Modifier.size(17.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("اكتشف الغرف")
                        }
                    }
                    Icon(Icons.Default.Groups, null, tint = Brand, modifier = Modifier.size(58.dp))
                }
            }
        }
        item { SectionTitle("الوصول السريع") }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                QuickAction("محادثات", Icons.Default.Chat, Modifier.weight(1f))
                QuickAction("مكالمات", Icons.Default.Call, Modifier.weight(1f))
                QuickAction("ألعاب", Icons.Default.SportsEsports, Modifier.weight(1f))
                QuickAction("اللحظات", Icons.Default.PhotoLibrary, Modifier.weight(1f))
            }
        }
        item { SectionTitle("الغرف الصوتية", "عرض الكل", onRooms) }
        item { EmptyPanel("الغرف ستظهر هنا", "عند تفعيل خدمة الغرف المباشرة وربط حسابك") }
        item { SectionTitle("الأصدقاء المقترحون") }
        item { EmptyPanel("اكتشف أشخاصًا جددًا", "سجّل الدخول لعرض اقتراحات مبنية على بيانات الخدمة") }
        item { SectionTitle("الألعاب") }
        item { EmptyPanel("مركز الألعاب", "الألعاب ستظهر بعد ربط جلسات اللعب والخدمات") }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RoomsScreen(modifier: Modifier = Modifier) {
    var selected by remember { mutableStateOf("الكل") }
    val filters = listOf("الكل", "نشطة", "جديدة", "أتابعها")
    Column(modifier.fillMaxSize()) {
        ScreenHeader("الغرف الصوتية", "اكتشف المحادثات المباشرة")
        ScrollableTabRow(selectedTabIndex = filters.indexOf(selected), containerColor = Ink, contentColor = Brand, edgePadding = 16.dp) {
            filters.forEach { filter -> Tab(selected == filter, { selected = filter }, text = { Text(filter) }) }
        }
        Column(Modifier.padding(16.dp)) {
            EmptyPanel("لا توجد غرف معروضة", "سيتم تحميل الغرف الحقيقية من الخادم. لا نعرض غرفًا أو أعضاءً تجريبيين.")
        }
    }
}

@Composable
private fun ChatsScreen(modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize()) {
        ScreenHeader("الرسائل", "محادثاتك ومكالماتك")
        Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            AssistChip(onClick = {}, label = { Text("الكل") }, leadingIcon = { Icon(Icons.Default.Chat, null) })
            AssistChip(onClick = {}, label = { Text("غير مقروءة") })
            AssistChip(onClick = {}, label = { Text("المكالمات") }, leadingIcon = { Icon(Icons.Default.Call, null) })
        }
        Column(Modifier.padding(16.dp)) {
            EmptyPanel("لا توجد محادثات للعرض", "سجّل الدخول لعرض رسائلك ومكالماتك الفعلية بأمان.")
        }
    }
}

@Composable
private fun MomentsScreen(modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize()) {
        ScreenHeader("اللحظات", "شارك الصور والفيديوهات مع مجتمعك")
        Surface(color = SurfaceWhite, shape = RoundedCornerShape(16.dp), modifier = Modifier.padding(16.dp).fillMaxWidth()) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AddCircleOutline, null, tint = Brand, modifier = Modifier.size(28.dp))
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("أنشئ لحظتك", color = TextMain, fontWeight = FontWeight.SemiBold)
                    Text("انشر صورة أو فيديو بعد تسجيل الدخول", color = TextMuted, fontSize = 11.sp)
                }
            }
        }
        Column(Modifier.padding(horizontal = 16.dp)) {
            EmptyPanel("لا توجد لحظات للعرض", "ستظهر منشورات الأصدقاء من الخادم بعد ربط الحساب.")
        }
    }
}

@Composable
private fun ProfileScreen(modifier: Modifier = Modifier, onSignOut: () -> Unit) {
    Column(modifier.fillMaxSize()) {
        ScreenHeader("حسابي", "ملفك الشخصي وإعداداتك")
        Surface(color = SurfaceWhite, shape = RoundedCornerShape(18.dp), modifier = Modifier.padding(16.dp).fillMaxWidth()) {
            Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(76.dp).background(Color(0xFFEAF1FF), CircleShape), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, null, tint = Brand, modifier = Modifier.size(38.dp))
                }
                Spacer(Modifier.height(10.dp))
                Text("ملف VOX ROYALE", color = TextMain, fontWeight = FontWeight.Bold)
                Text("أنت مسجل الدخول", color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(12.dp))
                Button(onClick = onSignOut, shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB4233A))) { Text("تسجيل الخروج") }
            }
        }
        ProfileRow(Icons.Default.AccountBalanceWallet, "المحفظة", "الرصيد وسجل المعاملات")
        ProfileRow(Icons.Default.StarOutline, "العضوية المميزة", "مزايا واشتراكات VIP")
        ProfileRow(Icons.Default.Inventory2, "ممتلكاتي", "الإطارات والهدايا والعناصر")
        ProfileRow(Icons.Default.Settings, "الإعدادات", "الخصوصية واللغة والأمان")
        ProfileRow(Icons.Default.HelpOutline, "المساعدة", "الدعم والإبلاغ")
    }
}

@Composable
private fun ScreenHeader(title: String, subtitle: String) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 18.dp)) {
        Text(title, color = TextMain, fontSize = 23.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, color = TextMuted, fontSize = 12.sp)
    }
}

@Composable
private fun SectionTitle(title: String, action: String? = null, onAction: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(top = 22.dp, bottom = 11.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(title, color = TextMain, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        if (action != null) Text(action, color = Brand, fontSize = 12.sp, modifier = Modifier.clickable { onAction?.invoke() })
    }
}

@Composable
private fun QuickAction(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
    Surface(color = SurfaceWhite, shape = RoundedCornerShape(14.dp), modifier = modifier) {
        Column(Modifier.padding(vertical = 13.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, null, tint = Brand, modifier = Modifier.size(22.dp))
            Spacer(Modifier.height(6.dp))
            Text(label, color = TextMain, fontSize = 10.sp, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun EmptyPanel(title: String, description: String) {
    Surface(color = SurfaceWhite, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(17.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(42.dp).background(Color(0xFFEAF1FF), CircleShape), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.CloudOff, null, tint = Brand)
            }
            Spacer(Modifier.width(13.dp))
            Column {
                Text(title, color = TextMain, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                Spacer(Modifier.height(4.dp))
                Text(description, color = TextMuted, fontSize = 11.sp, lineHeight = 16.sp)
            }
        }
    }
}

@Composable
private fun ProfileRow(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, subtitle: String) {
    Surface(color = SurfaceWhite, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 3.dp), shape = RoundedCornerShape(12.dp)) {
        Row(Modifier.padding(horizontal = 14.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = Brand)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                Text(subtitle, color = TextMuted, fontSize = 10.sp)
            }
            Icon(Icons.Default.ChevronRight, null, tint = TextMuted)
        }
    }
}

@Composable
private fun BackendConfigurationNotice() {
    val configured = SupabaseRuntimeConfig.isConfigured
    Surface(
        color = if (configured) Color(0xFFEAF7F0) else Color(0xFFFFF5E8),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(
                if (configured) Icons.Default.SettingsSuggest else Icons.Default.CloudOff,
                contentDescription = null,
                tint = if (configured) Color(0xFF218653) else Color(0xFFB87520)
            )
            Spacer(Modifier.width(10.dp))
            Column {
                Text(
                    if (configured) "إعدادات Supabase متوفرة" else "يلزم إعداد اتصال Supabase",
                    color = TextMain,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    if (configured) "تم العثور على عنوان المشروع ومفتاح النشر؛ لم يتم بعد تأكيد الاتصال بالخادم."
                    else "أضف SUPABASE_URL وSUPABASE_PUBLISHABLE_KEY إلى إعدادات البناء لتفعيل خدمات الحساب.",
                    color = TextMuted,
                    fontSize = 10.sp,
                    lineHeight = 15.sp
                )
            }
        }
    }
}

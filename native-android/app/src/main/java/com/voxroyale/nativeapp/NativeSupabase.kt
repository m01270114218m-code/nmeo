package com.voxroyale.nativeapp

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.ExternalAuthAction
import io.github.jan.supabase.auth.FlowType

/**
 * Native Supabase client. Auth sessions are restored and refreshed by the Auth plugin.
 * Only the public publishable key is embedded in the Android client.
 */
internal object NativeSupabase {
    val client by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        check(SupabaseRuntimeConfig.isConfigured) {
            "Supabase public client configuration is missing."
        }
        createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_PUBLISHABLE_KEY
        ) {
            install(Auth) {
                flowType = FlowType.PKCE
                scheme = "com.voxroyale.app"
                host = "auth"
                defaultExternalAuthAction = ExternalAuthAction.CustomTabs()
            }
        }
    }
}

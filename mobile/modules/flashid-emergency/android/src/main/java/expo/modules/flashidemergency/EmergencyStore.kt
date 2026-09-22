package expo.modules.flashidemergency

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object EmergencyStore {
    private const val FILE = "flashid_emergency"
    private const val KEY_HANDLE = "handle"
    private const val KEY_OFFLINE = "offline_bundle"

    @Volatile
    private var cached: SharedPreferences? = null

    private fun prefs(context: Context): SharedPreferences =
        cached ?: synchronized(this) {
            cached ?: build(context).also { cached = it }
        }

    private fun build(context: Context): SharedPreferences {
        val direct = context.createDeviceProtectedStorageContext()
        val masterKey = MasterKey.Builder(direct)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            direct,
            FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    fun putHandle(context: Context, base64Url: String) =
        prefs(context).edit().putString(KEY_HANDLE, base64Url).apply()

    fun handle(context: Context): ByteArray? =
        prefs(context).getString(KEY_HANDLE, null)
            ?.let { Base64.decode(it, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP) }

    fun putOfflineBundle(context: Context, json: String) =
        prefs(context).edit().putString(KEY_OFFLINE, json).apply()

    fun offlineBundle(context: Context): String? = prefs(context).getString(KEY_OFFLINE, null)

    fun clear(context: Context) = prefs(context).edit().clear().apply()
}

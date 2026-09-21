package expo.modules.flashidemergency

import android.app.StatusBarManager
import android.content.ComponentName
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private fun ByteArray.b64u(): String =
    Base64.encodeToString(this, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)

class FlashidEmergencyModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("FlashidEmergency")

        AsyncFunction("generateEmergencyKey") {
            val generated = EmergencyKeys.generate()
            mapOf(
                "publicKeySpki" to generated.publicKeySpki.b64u(),
                "isStrongBoxBacked" to generated.isStrongBoxBacked,
            )
        }

        AsyncFunction("setEmergencyHandle") { handleB64Url: String ->
            EmergencyStore.putHandle(appContext.reactContext!!, handleB64Url)
        }

        AsyncFunction("setOfflineBundle") { json: String ->
            EmergencyStore.putOfflineBundle(appContext.reactContext!!, json)
        }

        AsyncFunction("isConfigured") {
            EmergencyStore.handle(appContext.reactContext!!) != null &&
                EmergencyKeys.loadPublicKey() != null
        }

        AsyncFunction("requestAddTile") { promise: expo.modules.kotlin.Promise ->
            val context = appContext.reactContext!!
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
                promise.resolve(false)
                return@AsyncFunction
            }
            context.getSystemService(StatusBarManager::class.java).requestAddTileService(
                ComponentName(context, EmergencyQrTileService::class.java),
                "FlashID Emergency",
                Icon.createWithResource(context, R.drawable.ic_flashid_emergency),
                { it.run() },
                { result ->
                    promise.resolve(
                        result == StatusBarManager.TILE_ADD_REQUEST_RESULT_TILE_ADDED ||
                            result == StatusBarManager.TILE_ADD_REQUEST_RESULT_TILE_ALREADY_ADDED
                    )
                },
            )
        }

        AsyncFunction("disableEmergency") {
            EmergencyStore.clear(appContext.reactContext!!)
            EmergencyKeys.delete()
        }
    }
}
package expo.modules.flashidemergency

import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

class EmergencyQrTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        val configured = EmergencyStore.handle(applicationContext) != null
        qsTile?.apply {
            state = if (configured) Tile.STATE_INACTIVE else Tile.STATE_UNAVAILABLE
            subtitle = if (configured) "Show emergency QR" else "Set up in FlashID"
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()

        val intent = Intent(this, EmergencyQrActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val pending = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
            startActivityAndCollapse(pending)
        } else {
            @Suppress("DEPRECATION")
            startActivityAndCollapse(intent)
        }
    }
}
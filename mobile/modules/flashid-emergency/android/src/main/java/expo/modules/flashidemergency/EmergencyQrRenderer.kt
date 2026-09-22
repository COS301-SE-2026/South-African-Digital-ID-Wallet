package expo.modules.flashidemergency

import android.graphics.Bitmap
import android.graphics.Color
import android.util.Base64
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import org.json.JSONObject

object EmergencyQrRenderer {
    private const val HELP_URL = "https://flashid.co.za/e"
    private const val CHUNK = 600

    fun onlineCodeText(handle: ByteArray, nowSeconds: Long = System.currentTimeMillis() / 1000): String {
        val signature = EmergencyKeys.sign(handle, nowSeconds)
        val ts = byteArrayOf(
            (nowSeconds shr 24).toByte(), (nowSeconds shr 16).toByte(),
            (nowSeconds shr 8).toByte(), nowSeconds.toByte(),
        )
        return "$HELP_URL#1.${handle.b64u()}.${ts.b64u()}.${signature.b64u()}"
    }

    fun online(handle: ByteArray, sizePx: Int): Bitmap = encode(onlineCodeText(handle), sizePx)

    fun offlineFrames(handle: ByteArray, bundleJson: String, sizePx: Int): List<Bitmap> {
        val bundle = JSONObject(bundleJson)
        val payload = bundle.getString("payload")
        val signature = bundle.getString("signature")

        val chunks = "$payload.$signature".chunked(CHUNK)
        val total = chunks.size + 1

        val frames = chunks.mapIndexed { index, chunk ->
            encode("FIDE1/$index/$total/$chunk", sizePx)
        }

        val now = System.currentTimeMillis() / 1000
        val proof = "FIDEF1/$now/${EmergencyKeys.sign(handle, now).b64u()}"
        return frames + encode("FIDE1/${total - 1}/$total/$proof", sizePx)
    }

    private fun encode(text: String, sizePx: Int): Bitmap {
        val hints = mapOf(
            EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.M,
            EncodeHintType.MARGIN to 2,
            EncodeHintType.CHARACTER_SET to "UTF-8",
        )
        val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, sizePx, sizePx, hints)
        val pixels = IntArray(sizePx * sizePx)
        for (y in 0 until sizePx) {
            val row = y * sizePx
            for (x in 0 until sizePx) {
                pixels[row + x] = if (matrix[x, y]) Color.BLACK else Color.WHITE
            }
        }
        return Bitmap.createBitmap(pixels, sizePx, sizePx, Bitmap.Config.RGB_565)
    }

    private fun ByteArray.b64u(): String =
        Base64.encodeToString(this, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
}

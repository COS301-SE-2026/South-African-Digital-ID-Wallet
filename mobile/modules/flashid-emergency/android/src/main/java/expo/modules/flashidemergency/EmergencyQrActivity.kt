package expo.modules.flashidemergency

import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import expo.modules.flashidemergency.databinding.ActivityEmergencyQrBinding

class EmergencyQrActivity : AppCompatActivity() {

    private companion object {
        const val VALID_MS = 120_000L
        const val REFRESH_MS = 45_000L
        const val FRAME_MS = 125L
        const val KEY_BINDING_REFRESH_MS = 5_000L
    }

    private lateinit var binding: ActivityEmergencyQrBinding
    private var countdown: CountDownTimer? = null
    private var handle: ByteArray? = null
    private var isOfflineMode = false

    private var offlineSdJwt: String? = null
    private var presentationId: String? = null
    private var payloadFrames: List<Bitmap> = emptyList()
    private var offlineFrames: List<Bitmap> = emptyList()
    private var offlineFrameIndex = 0

    private val showNextFrame = object : Runnable {
        override fun run() {
            if (!isOfflineMode || offlineFrames.isEmpty()) return
            binding.qr.setImageBitmap(offlineFrames[offlineFrameIndex % offlineFrames.size])
            offlineFrameIndex++
            binding.qr.postDelayed(this, FRAME_MS)
        }
    }

    private val resignKeyBinding = object : Runnable {
        override fun run() {
            if (!isOfflineMode) return
            try {
                signKeyBindingFrame()
            } catch (e: Exception) {
                showUnavailable()
                return
            }
            binding.qr.postDelayed(this, KEY_BINDING_REFRESH_MS)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }

        window.attributes = window.attributes.apply { screenBrightness = 1f }
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)

        binding = ActivityEmergencyQrBinding.inflate(layoutInflater)
        setContentView(binding.root)

        handle = try {
            EmergencyStore.handle(applicationContext)
        } catch (e: Exception) {
            showUnavailable()
            return
        }
        if (handle == null) {
            binding.message.text = getString(R.string.emergency_not_configured)
            return
        }

        binding.offlineToggle.setOnClickListener {
            isOfflineMode = !isOfflineMode
            render()
        }

        render()
        startCountdown()
    }

    private fun render() {
        try {
            draw()
        } catch (e: Exception) {
            showUnavailable()
        }
    }

    private fun showUnavailable() {
        stopOfflineAnimation()
        countdown?.cancel()
        binding.qr.setImageDrawable(null)
        binding.caption.text = ""
        binding.countdown.text = ""
        binding.offlineToggle.visibility = android.view.View.GONE
        binding.message.text = getString(R.string.emergency_locked_after_restart)
    }

    private fun draw() {
        val handle = handle ?: return
        stopOfflineAnimation()
        val size = resources.getDimensionPixelSize(R.dimen.emergency_qr_size)

        if (!isOfflineMode) {
            binding.qr.setImageBitmap(EmergencyQrRenderer.online(handle, size))
            binding.caption.setText(R.string.emergency_caption_online)
            binding.offlineToggle.setText(R.string.emergency_no_signal)
            return
        }

        binding.offlineToggle.setText(R.string.emergency_back_online)

        val sdJwt = EmergencyStore.offlineBundle(applicationContext)?.takeIf(OfflineFrames::isSdJwt)
        if (sdJwt == null) {
            binding.caption.setText(R.string.emergency_no_offline_bundle)
            return
        }

        binding.caption.setText(R.string.emergency_caption_offline)
        val id = EmergencyQrRenderer.newPresentationId()
        offlineSdJwt = sdJwt
        presentationId = id
        payloadFrames = EmergencyQrRenderer.offlinePayloadFrames(sdJwt, id, size)
        offlineFrameIndex = 0
        signKeyBindingFrame()

        binding.qr.post(showNextFrame)
        binding.qr.postDelayed(resignKeyBinding, KEY_BINDING_REFRESH_MS)
    }

    private fun signKeyBindingFrame() {
        val sdJwt = offlineSdJwt ?: return
        val id = presentationId ?: return
        val size = resources.getDimensionPixelSize(R.dimen.emergency_qr_size)
        offlineFrames = OfflineFrames.interleave(
            payloadFrames,
            EmergencyQrRenderer.offlineKeyBindingFrame(sdJwt, id, size),
        )
    }

    private fun stopOfflineAnimation() {
        binding.qr.removeCallbacks(showNextFrame)
        binding.qr.removeCallbacks(resignKeyBinding)
    }

    private fun startCountdown() {
        countdown?.cancel()
        countdown = object : CountDownTimer(VALID_MS, 1_000L) {
            override fun onTick(remaining: Long) {
                binding.countdown.text = getString(R.string.emergency_expires_in, remaining / 1000)
                if (!isOfflineMode && (VALID_MS - remaining) % REFRESH_MS < 1_000L) render()
            }
            override fun onFinish() = finish()
        }.start()
    }

    override fun onStop() {
        super.onStop()
        finish()
    }

    override fun onDestroy() {
        stopOfflineAnimation()
        countdown?.cancel()
        super.onDestroy()
    }
}
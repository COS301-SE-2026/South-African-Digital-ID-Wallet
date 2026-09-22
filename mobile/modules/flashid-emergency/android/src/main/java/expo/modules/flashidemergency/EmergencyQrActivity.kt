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
        const val FRAME_MS = 700L
    }

    private lateinit var binding: ActivityEmergencyQrBinding
    private var countdown: CountDownTimer? = null
    private var handle: ByteArray? = null
    private var isOfflineMode = false

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

        handle = EmergencyStore.handle(applicationContext)
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
        val handle = handle ?: return
        val size = resources.getDimensionPixelSize(R.dimen.emergency_qr_size)

        if (!isOfflineMode) {
            binding.qr.setImageBitmap(EmergencyQrRenderer.online(handle, size))
            binding.caption.setText(R.string.emergency_caption_online)
            binding.offlineToggle.setText(R.string.emergency_no_signal)
            return
        }

        val bundle = EmergencyStore.offlineBundle(applicationContext)
        if (bundle == null) {
            binding.caption.setText(R.string.emergency_no_offline_bundle)
            return
        }
        binding.caption.setText(R.string.emergency_caption_offline)
        binding.offlineToggle.setText(R.string.emergency_back_online)
        animateFrames(EmergencyQrRenderer.offlineFrames(handle, bundle, size))
    }

    private fun animateFrames(frames: List<Bitmap>) {
        var index = 0
        val runnable = object : Runnable {
            override fun run() {
                if (!isOfflineMode) return
                binding.qr.setImageBitmap(frames[index % frames.size])
                index++
                binding.qr.postDelayed(this, FRAME_MS)
            }
        }
        binding.qr.post(runnable)
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
        countdown?.cancel()
        super.onDestroy()
    }
}
package expo.modules.flashidemergency

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.security.keystore.StrongBoxUnavailableException
import java.nio.ByteBuffer
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.spec.ECGenParameterSpec

object EmergencyKeys {
    const val ALIAS = "flashid.emergency.v1"
    private const val PROVIDER = "AndroidKeyStore"
    private val CONTEXT = "FIDEMG1".toByteArray(Charsets.US_ASCII)

    data class Generated(val publicKeySpki: ByteArray, val isStrongBoxBacked: Boolean)

    fun generate(): Generated {
        val existing = loadPublicKey()
        if (existing != null) return Generated(existing, isStrongBox())

        return try {
            Generated(createKey(strongBox = true), isStrongBox())
        } catch (_: StrongBoxUnavailableException) {
            Generated(createKey(strongBox = false), false)
        }
    }

    private fun createKey(strongBox: Boolean): ByteArray {
        val spec = KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_SIGN)
            .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setUserAuthenticationRequired(false)
            .apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    setIsStrongBoxBacked(strongBox)
                }
            }
            .build()

        val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, PROVIDER)
        generator.initialize(spec)
        return generator.generateKeyPair().public.encoded
    }

    fun loadPublicKey(): ByteArray? = keyStore().getCertificate(ALIAS)?.publicKey?.encoded

    fun delete() = keyStore().deleteEntry(ALIAS)

    fun sign(handle: ByteArray, unixSeconds: Long): ByteArray {
        require(handle.size == 16) { "Emergency handle must be 16 bytes" }

        val message = ByteBuffer.allocate(CONTEXT.size + 20)
            .put(CONTEXT)
            .put(handle)
            .putInt(unixSeconds.toInt())
            .array()

        val key = keyStore().getKey(ALIAS, null) as PrivateKey
        return Signature.getInstance("SHA256withECDSA").run {
            initSign(key)
            update(message)
            sign()
        }
    }

    private fun isStrongBox(): Boolean {
        val key = keyStore().getKey(ALIAS, null) as? PrivateKey ?: return false
        val info = KeyFactory.getInstance(key.algorithm, PROVIDER)
            .getKeySpec(key, KeyInfo::class.java)
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            info.securityLevel == KeyProperties.SECURITY_LEVEL_STRONGBOX
        } else {
            @Suppress("DEPRECATION")
            info.isInsideSecureHardware
        }
    }
    private fun keyStore() = KeyStore.getInstance(PROVIDER).apply { load(null) }
}
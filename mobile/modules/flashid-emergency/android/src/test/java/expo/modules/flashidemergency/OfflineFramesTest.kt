package expo.modules.flashidemergency

import java.io.File
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.MessageDigest
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.util.Base64
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OfflineFramesTest {
    private val payloadPattern = Regex("^FID1:P:([A-Za-z0-9_-]{6}):(\\d+)/(\\d+):([A-Za-z0-9._~-]+)$")
    private val keyBindingPattern =
        Regex("^FID1:K:([A-Za-z0-9_-]{6}):([A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)$")

    private val decoder = Base64.getUrlDecoder()

    private fun p256(): KeyPair =
        KeyPairGenerator.getInstance("EC").apply { initialize(ECGenParameterSpec("secp256r1")) }.generateKeyPair()

    private fun derSigner(keys: KeyPair): (ByteArray) -> ByteArray = { data ->
        Signature.getInstance("SHA256withECDSA").run {
            initSign(keys.private)
            update(data)
            sign()
        }
    }

    private fun verifiesAsJws(keys: KeyPair, data: ByteArray, rawSignature: ByteArray): Boolean =
        Signature.getInstance("SHA256withECDSAinP1363Format").run {
            initVerify(keys.public)
            update(data)
            verify(rawSignature)
        }

    @Test
    fun derToRaw_producesSignaturesTheJdkAcceptsAsJws() {
        val keys = p256()
        val sign = derSigner(keys)

        repeat(500) { attempt ->
            val data = "message-$attempt".toByteArray()
            val raw = OfflineFrames.derToRaw(sign(data))

            assertEquals(64, raw.size)
            assertTrue("signature $attempt", verifiesAsJws(keys, data, raw))
        }
    }

    @Test
    fun derToRaw_padsAShortCoordinateAndDropsTheSignByte() {
        val r = ByteArray(31) { 0x11 }
        val s = byteArrayOf(0x00) + ByteArray(32) { 0x80.toByte() }
        val der = byteArrayOf(0x30, (2 + r.size + 2 + s.size).toByte(), 0x02, r.size.toByte()) + r +
            byteArrayOf(0x02, s.size.toByte()) + s

        val raw = OfflineFrames.derToRaw(der)

        assertArrayEquals(byteArrayOf(0x00) + r, raw.copyOfRange(0, 32))
        assertArrayEquals(ByteArray(32) { 0x80.toByte() }, raw.copyOfRange(32, 64))
    }

    @Test
    fun keyBindingJwt_isAnEs256KbJwtOverTheSdJwtHash() {
        val keys = p256()
        val sdJwt = "issuer.jwt.signature~disclosure-one~disclosure-two~"

        val jwt = OfflineFrames.keyBindingJwt(sdJwt, 1_790_000_000, derSigner(keys))
        val (header, payload, signature) = jwt.split('.')

        assertEquals("""{"alg":"ES256","typ":"kb+jwt"}""", String(decoder.decode(header)))
        val expectedHash = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(MessageDigest.getInstance("SHA-256").digest(sdJwt.toByteArray()))
        assertEquals("""{"iat":1790000000,"sd_hash":"$expectedHash"}""", String(decoder.decode(payload)))
        assertTrue(verifiesAsJws(keys, "$header.$payload".toByteArray(), decoder.decode(signature)))
    }

    @Test
    fun base64Url_matchesTheJdkForEveryLengthRemainder() {
        val jdk = Base64.getUrlEncoder().withoutPadding()
        for (length in 0..130) {
            val bytes = ByteArray(length) { (it * 37 + length).toByte() }
            assertEquals("length $length", jdk.encodeToString(bytes), OfflineFrames.base64Url(bytes))
        }
    }

    @Test
    fun payloadFrames_areFramesTheWalletAccumulatorAccepts() {
        val sdJwt = "a".repeat(1000) + "~" + "b".repeat(500) + "~"

        val frames = OfflineFrames.payloadFrames(sdJwt, "AbCdEf")

        assertEquals(4, frames.size)
        val chunks = frames.mapIndexed { index, frame ->
            val match = payloadPattern.matchEntire(frame)!!
            assertEquals("AbCdEf", match.groupValues[1])
            assertEquals(index.toString(), match.groupValues[2])
            assertEquals(frames.size.toString(), match.groupValues[3])
            assertTrue(match.groupValues[4].length <= OfflineFrames.PAYLOAD_FRAME_SIZE)
            match.groupValues[4]
        }
        assertEquals(sdJwt, chunks.joinToString(""))
    }

    @Test
    fun payloadFrames_carryTheBackendsRealEmergencyCredential() {
        val fixture = File("../../../../backend/FlashIdBackend/tests/TestData/offline-verification/emergency-cross-stack-fixture.json")
            .readText()
        val presentation = Regex("\"presentation\":\\s*\"([^\"]+)\"").find(fixture)!!.groupValues[1]
        val sdJwt = presentation.substring(0, presentation.lastIndexOf('~') + 1)

        val frames = OfflineFrames.payloadFrames(sdJwt, "AbCdEf")

        assertTrue(frames.all { payloadPattern.matches(it) })
        assertEquals(sdJwt, frames.joinToString("") { payloadPattern.matchEntire(it)!!.groupValues[4] })
        assertTrue(OfflineFrames.isSdJwt(sdJwt))
    }

    @Test
    fun keyBindingFrame_isAFrameTheWalletAccumulatorAccepts() {
        val jwt = OfflineFrames.keyBindingJwt("x.y.z~", 1_790_000_000, derSigner(p256()))

        assertTrue(keyBindingPattern.matches(OfflineFrames.keyBindingFrame("AbCdEf", jwt)))
    }

    @Test
    fun interleave_putsAKeyBindingFrameAfterEveryThirdAndTheLast() {
        val frames = OfflineFrames.interleave(listOf("P0", "P1", "P2", "P3", "P4"), "K")

        assertEquals(listOf("P0", "P1", "P2", "K", "P3", "P4", "K"), frames)
    }

    @Test
    fun isSdJwt_refusesABundleFromAnOlderBuild() {
        assertTrue(OfflineFrames.isSdJwt("header.payload.signature~disclosure~"))
        assertFalse(OfflineFrames.isSdJwt("""{"payload":"x","signature":"y"}"""))
        assertFalse(OfflineFrames.isSdJwt("header.payload.signature"))
    }
}

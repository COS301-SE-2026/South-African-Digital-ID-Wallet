package expo.modules.flashidemergency

import java.security.MessageDigest

object OfflineFrames {
    const val PAYLOAD_FRAME_SIZE = 450
    private const val PAYLOAD_PREFIX = "FID1:P"
    private const val KEY_BINDING_PREFIX = "FID1:K"
    private const val PAYLOAD_FRAMES_PER_KEY_BINDING_FRAME = 3
    private const val COORDINATE_BYTES = 32
    private val PRESENTATION_ID = Regex("^[A-Za-z0-9_-]{6}$")

    fun payloadFrames(sdJwt: String, presentationId: String): List<String> {
        require(sdJwt.isNotEmpty()) { "The presentation cannot be empty." }
        require(PRESENTATION_ID.matches(presentationId)) { "The presentation id must be 6 base64url characters." }

        val chunks = sdJwt.chunked(PAYLOAD_FRAME_SIZE)
        return chunks.mapIndexed { index, chunk -> "$PAYLOAD_PREFIX:$presentationId:$index/${chunks.size}:$chunk" }
    }

    fun keyBindingFrame(presentationId: String, keyBindingJwt: String): String =
        "$KEY_BINDING_PREFIX:$presentationId:$keyBindingJwt"

    fun <T> interleave(payloadFrames: List<T>, keyBindingFrame: T): List<T> =
        payloadFrames.flatMapIndexed { index, frame ->
            if ((index + 1) % PAYLOAD_FRAMES_PER_KEY_BINDING_FRAME == 0 || index == payloadFrames.lastIndex) {
                listOf(frame, keyBindingFrame)
            } else {
                listOf(frame)
            }
        }

    fun keyBindingJwt(sdJwt: String, issuedAt: Long, signDer: (ByteArray) -> ByteArray): String {
        val sdHash = base64Url(MessageDigest.getInstance("SHA-256").digest(sdJwt.toByteArray(Charsets.US_ASCII)))
        val header = base64Url("""{"alg":"ES256","typ":"kb+jwt"}""".toByteArray(Charsets.UTF_8))
        val payload = base64Url("""{"iat":$issuedAt,"sd_hash":"$sdHash"}""".toByteArray(Charsets.UTF_8))
        val signingInput = "$header.$payload"

        return "$signingInput.${base64Url(derToRaw(signDer(signingInput.toByteArray(Charsets.US_ASCII))))}"
    }

    fun isSdJwt(value: String): Boolean =
        value.endsWith("~") && value.substringBefore('~').split('.').size == 3

    fun derToRaw(der: ByteArray): ByteArray {
        var offset = 0

        fun readLength(): Int {
            val first = der[offset++].toInt() and 0xFF
            if (first < 0x80) return first
            var length = 0
            repeat(first and 0x7F) { length = (length shl 8) or (der[offset++].toInt() and 0xFF) }
            return length
        }

        fun readCoordinate(): ByteArray {
            require(der[offset++] == 0x02.toByte()) { "Expected an ASN.1 INTEGER." }
            val length = readLength()
            val value = der.copyOfRange(offset, offset + length).dropWhile { it == 0.toByte() }.toByteArray()
            offset += length
            require(value.size <= COORDINATE_BYTES) { "Signature value is too large for P-256." }
            return ByteArray(COORDINATE_BYTES - value.size) + value
        }

        require(der[offset++] == 0x30.toByte()) { "Expected an ASN.1 SEQUENCE." }
        readLength()
        return readCoordinate() + readCoordinate()
    }

    private const val ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    fun base64Url(bytes: ByteArray): String {
        val out = StringBuilder((bytes.size * 4 + 2) / 3)
        var index = 0
        while (index + 3 <= bytes.size) {
            val block = ((bytes[index].toInt() and 0xFF) shl 16) or
                ((bytes[index + 1].toInt() and 0xFF) shl 8) or
                (bytes[index + 2].toInt() and 0xFF)
            out.append(ALPHABET[block shr 18 and 63]).append(ALPHABET[block shr 12 and 63])
                .append(ALPHABET[block shr 6 and 63]).append(ALPHABET[block and 63])
            index += 3
        }
        when (bytes.size - index) {
            1 -> {
                val block = (bytes[index].toInt() and 0xFF) shl 16
                out.append(ALPHABET[block shr 18 and 63]).append(ALPHABET[block shr 12 and 63])
            }
            2 -> {
                val block = ((bytes[index].toInt() and 0xFF) shl 16) or ((bytes[index + 1].toInt() and 0xFF) shl 8)
                out.append(ALPHABET[block shr 18 and 63]).append(ALPHABET[block shr 12 and 63])
                    .append(ALPHABET[block shr 6 and 63])
            }
        }
        return out.toString()
    }
}

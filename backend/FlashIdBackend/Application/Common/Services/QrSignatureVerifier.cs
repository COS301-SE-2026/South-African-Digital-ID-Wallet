using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text.Json;
using Application.Common.Interfaces.RepositoryInterfaces;
using Application.Common.Interfaces.ServiceInterfaces;
using Domain.Enums;

namespace Application.Common.Services;

public class QrSignatureVerifier : IQrSignatureVerifier
{
    private readonly ISigningKeyRepository _signingKeyRepository;

    public QrSignatureVerifier(ISigningKeyRepository signingKeyRepository)
    {
        _signingKeyRepository = signingKeyRepository;
    }

    public async Task<bool> VerifyAsync(string kid, string alg, byte[] signingInput, byte[] signature, CancellationToken cancellationToken)
    {
        var signingKey = await _signingKeyRepository.GetByKidAsync(kid);

        if (signingKey == null
            || signingKey.Purpose != SigningKeyPurpose.Qr
            || signingKey.Status == SigningKeyStatus.Revoked
            || signingKey.Algorithm != alg)
        {
            return false;
        }

        JsonElement jwk;
        try
        {
            jwk = JsonDocument.Parse(signingKey.PublicKeyJwk).RootElement;
        }
        catch (JsonException)
        {
            return false;
        }

        if (!jwk.TryGetProperty("x", out var xProp) || !jwk.TryGetProperty("y", out var yProp))
        {
            return false;
        }

        var x = xProp.GetString();
        var y = yProp.GetString();
        if (string.IsNullOrEmpty(x) || string.IsNullOrEmpty(y))
        {
            return false;
        }

        using var verifier = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint
            {
                X = Base64Url.DecodeFromChars(x),
                Y = Base64Url.DecodeFromChars(y),
            },
        });

        return verifier.VerifyData(signingInput, signature, HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);
    }
}
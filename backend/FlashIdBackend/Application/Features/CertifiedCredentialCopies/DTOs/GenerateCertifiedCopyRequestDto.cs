using System.Text.Json.Serialization;
using Application.Features.Credentials.Enums;

namespace Application.Features.CertifiedCredentialCopies.DTOs;

public class GenerateCertifiedCopyRequestDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public CredentialType CredentialType { get; set; }
}
namespace Application.Features.Credentials.DTOs;

public class GenerateQrRequestDto
{
    public List<string> DisclosedFields { get; set; } = new();
}
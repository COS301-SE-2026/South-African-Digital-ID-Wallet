namespace Application.Features.Verification.Dtos;

public class LivenessVerificationResult
{
    public string Status { get; set; }
    public bool? LivenessPassed { get; set; }
    public bool? FaceMatched { get; set; }
    public double? MatchConfidence { get; set; }
    public bool IsComplete { get; set; }
}
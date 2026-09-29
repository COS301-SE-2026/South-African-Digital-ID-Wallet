using System.Globalization;
using Application.Common.Interfaces.ProviderInterfaces;
using Application.Features.CertifiedCredentialCopies.Models;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Infrastructure.Providers;

public class CertifiedCopyPdfProvider : ICertifiedCopyPdfProvider
{
    private readonly byte[]? _logoBytes;

    public CertifiedCopyPdfProvider()
    {
        var logoPath = Path.Combine(AppContext.BaseDirectory, "Assets", "Brand", "logo.png");

        if (File.Exists(logoPath))
            _logoBytes = File.ReadAllBytes(logoPath);
    }

    public byte[] Generate(CertifiedCredentialSnapshot snapshot, Guid certificationId, string verificationUrl,
        DateTime generatedAt, byte[]? photoBytes = null)
    {
        ArgumentNullException.ThrowIfNull(snapshot);
        ArgumentException.ThrowIfNullOrWhiteSpace(verificationUrl);

        var qrCodeBytes = GenerateQrCode(verificationUrl);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                page.DefaultTextStyle(style => style.FontFamily(FlashIdTheme.FontFamily).FontColor(FlashIdTheme.TextPrimary).FontSize(10));

                page.Header().Element(ComposeHeader);

                page.Content().PaddingVertical(24).Column(column =>
                    {
                        column.Spacing(20);

                        column.Item().Element(c => ComposeTitle(c, snapshot));
                        column.Item().Element(c => ComposeCitizenDetails(c, snapshot, photoBytes));
                        column.Item().Element(c => ComposeCredentialDetails(c, snapshot));
                        column.Item().Element(c => ComposeVerificationSection(c, certificationId, generatedAt, qrCodeBytes));
                    });

                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private static byte[] GenerateQrCode(string verificationUrl)
    {
        using var qrGenerator = new QRCodeGenerator();

        using var qrData = qrGenerator.CreateQrCode(
            verificationUrl,
            QRCodeGenerator.ECCLevel.Q);

        var qrCode = new PngByteQRCode(qrData);

        return qrCode.GetGraphic(20);
    }

    private static class FlashIdTheme
    {
        public const string PrimaryGreen = "#007A4D";
        public const string DeepGreen = "#053B2C";
        public const string AccentGold = "#FFB81C";

        public const string Cream = "#F7F4EA";
        public const string White = "#FFFFFF";

        public const string TextPrimary = "#111827";
        public const string MutedText = "#6B7280";
        public const string BorderGrey = "#E5E7EB";

        public const string SuccessGreen = "#16A34A";

        public const string FontFamily = "Lato";
    }

    private void ComposeHeader(IContainer container)
    {
        container
            .PaddingBottom(12)
            .BorderBottom(3)
            .BorderColor(FlashIdTheme.AccentGold)
            .Row(row =>
            {
                row.ConstantItem(155).Height(48).Element(logo =>
                {
                    if (_logoBytes is { Length: > 0 })
                    {
                        logo.Image(_logoBytes).FitArea();
                    }
                    else
                    {
                        logo.AlignLeft().AlignMiddle()
                            .Text("FlashID")
                            .Bold()
                            .FontSize(24)
                            .FontColor(FlashIdTheme.DeepGreen);
                    }
                });

                row.RelativeItem().AlignRight().AlignMiddle().Column(column =>
                {
                    column.Item()
                        .AlignRight()
                        .Text("CERTIFIED COPY")
                        .Bold()
                        .FontSize(18)
                        .FontColor(FlashIdTheme.DeepGreen);

                    column.Item()
                        .PaddingTop(2)
                        .AlignRight()
                        .Text("IDENTITY & CREDENTIAL VERIFICATION")
                        .FontSize(7)
                        .FontColor(FlashIdTheme.MutedText);
                });
            });
    }

    private static void ComposeTitle(IContainer container, CertifiedCredentialSnapshot snapshot)
    {
        var credentialName = snapshot.CredentialType switch
        {
            "DriversLicense" => "DRIVER'S LICENCE",
            "IdentityDocument" => "IDENTITY DOCUMENT",
            _ => "DIGITAL CREDENTIAL"
        };

        container
            .Background(FlashIdTheme.DeepGreen)
            .Padding(20)
            .Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item()
                        .Text("CERTIFIED DIGITAL CREDENTIAL")
                        .Bold()
                        .FontSize(9)
                        .FontColor(FlashIdTheme.AccentGold);

                    column.Item()
                        .PaddingTop(5)
                        .Text(credentialName)
                        .Bold()
                        .FontSize(22)
                        .FontColor(FlashIdTheme.White);

                    column.Item()
                        .PaddingTop(5)
                        .Text("Securely issued and verifiable through FlashID")
                        .FontSize(9)
                        .FontColor("#D1E7DF");
                });

                row.ConstantItem(90).AlignMiddle().AlignRight()
                    .Text("VERIFIED")
                    .Bold()
                    .FontSize(10)
                    .FontColor(FlashIdTheme.AccentGold);
            });
    }

    private static void ComposeCitizenDetails(IContainer container, CertifiedCredentialSnapshot snapshot, byte[]? photoBytes)
    {
        container.PaddingVertical(6).Row(row =>
        {
            row.ConstantItem(105).Height(125).Element(photo =>
            {
                if (photoBytes is { Length: > 0 })
                {
                    photo
                        .Border(2)
                        .BorderColor(FlashIdTheme.AccentGold)
                        .Image(photoBytes)
                        .FitArea();
                }
                else
                {
                    photo
                        .Border(1)
                        .BorderColor(FlashIdTheme.BorderGrey)
                        .Background(FlashIdTheme.Cream)
                        .AlignCenter()
                        .AlignMiddle()
                        .Text("PHOTO")
                        .FontSize(8)
                        .FontColor(FlashIdTheme.MutedText);
                }
            });

            row.ConstantItem(25);

            row.RelativeItem().AlignMiddle().Column(column =>
            {
                column.Item()
                    .Text(snapshot.FullName.ToUpperInvariant())
                    .Bold()
                    .FontSize(18)
                    .FontColor(FlashIdTheme.DeepGreen);

                column.Item().PaddingTop(12).Row(details =>
                {
                    details.RelativeItem().Column(field =>
                    {
                        AddField(field, "ID NUMBER", snapshot.IdNumber);
                    });

                    details.RelativeItem().Column(field =>
                    {
                        AddField(field, "DATE OF BIRTH", FormatDate(snapshot.DateOfBirth));
                    });
                });
            });
        });
    }

    private static void ComposeCredentialDetails(IContainer container, CertifiedCredentialSnapshot snapshot)
    {
        container.Column(column =>
        {
            column.Item()
                .Text("CREDENTIAL DETAILS")
                .Bold()
                .FontSize(12)
                .FontColor(FlashIdTheme.DeepGreen);

            column.Item().PaddingTop(10).Element(details =>
            {
                switch (snapshot.CredentialType)
                {
                    case "IdentityDocument":
                        ComposeIdentityDocumentDetails(details, snapshot);
                        break;

                    case "DriversLicense":
                        ComposeDriversLicenseDetails(details, snapshot);
                        break;

                    default:
                        ComposeCommonCredentialDetails(details, snapshot);
                        break;
                }
            });
        });
    }

    private static void ComposeIdentityDocumentDetails(IContainer container, CertifiedCredentialSnapshot snapshot)
    {
        container
            .Background(FlashIdTheme.White)
            .Border(1)
            .BorderColor(FlashIdTheme.BorderGrey)
            .Padding(18)
            .Column(column =>
            {
                column.Spacing(16);

                AddTwoFields(column, "CITIZENSHIP", snapshot.Citizenship, "COUNTRY OF BIRTH", snapshot.CountryOfBirth);
                AddTwoFields(column, "NATIONALITY", snapshot.Nationality, "ISSUE DATE", FormatDate(snapshot.IssueDate));
            });
    }

    private static void ComposeDriversLicenseDetails(IContainer container, CertifiedCredentialSnapshot snapshot)
    {
        container
            .Background(FlashIdTheme.White)
            .Border(1)
            .BorderColor(FlashIdTheme.BorderGrey)
            .Padding(18)
            .Column(column =>
            {
                column.Spacing(16);

                AddTwoFields(column, "LICENCE NUMBER", snapshot.LicenseNumber, "LICENCE CODE", snapshot.LicenseCode);
                AddTwoFields(column, "RESTRICTIONS", snapshot.Restrictions, "COUNTRY OF ISSUE", snapshot.CountryOfIssue);
                AddTwoFields(column, "ISSUE DATE", FormatDate(snapshot.IssueDate), "EXPIRY DATE", FormatDate(snapshot.ExpiryDate));
            });
    }

    private static void ComposeCommonCredentialDetails(IContainer container, CertifiedCredentialSnapshot snapshot)
    {
        container
            .Background(FlashIdTheme.White)
            .Border(1)
            .BorderColor(FlashIdTheme.BorderGrey)
            .Padding(18)
            .Column(column =>
            {
                column.Spacing(16);

                AddTwoFields(column, "ISSUED BY", snapshot.IssuedBy, "ISSUE DATE", FormatDate(snapshot.IssueDate));
            });
    }

    private static void ComposeVerificationSection(IContainer container, Guid certificationId, DateTime generatedAt, byte[] qrCodeBytes)
    {
        container
            .Background(FlashIdTheme.DeepGreen)
            .Padding(20)
            .Row(row =>
            {
                row.RelativeItem().PaddingRight(25).Column(column =>
                {
                    column.Item()
                        .Text("DIGITALLY CERTIFIED")
                        .Bold()
                        .FontSize(9)
                        .FontColor(FlashIdTheme.AccentGold);

                    column.Item()
                        .PaddingTop(6)
                        .Text("VERIFY THIS COPY")
                        .Bold()
                        .FontSize(17)
                        .FontColor(FlashIdTheme.White);

                    column.Item()
                        .PaddingTop(5)
                        .Text("Scan the QR code to confirm the authenticity and current validity of this digital credential.")
                        .FontSize(9)
                        .FontColor("#D1E7DF");

                    column.Item()
                        .PaddingTop(16)
                        .Text("CERTIFICATION ID")
                        .Bold()
                        .FontSize(7)
                        .FontColor(FlashIdTheme.AccentGold);

                    column.Item()
                        .PaddingTop(2)
                        .Text(certificationId.ToString())
                        .FontSize(8)
                        .FontColor(FlashIdTheme.White);

                    var southAfricaTime = generatedAt.AddHours(2);

                    column.Item()
                        .PaddingTop(10)
                        .Text($"Generated {southAfricaTime:dd MMMM yyyy HH:mm} SAST")
                        .FontSize(8)
                        .FontColor("#D1E7DF");
                });

                row.ConstantItem(125).Background(FlashIdTheme.White).Padding(8).Column(column =>
                {
                    column.Item()
                        .AlignCenter()
                        .Width(105)
                        .Height(105)
                        .Image(qrCodeBytes);

                    column.Item()
                        .PaddingTop(3)
                        .AlignCenter()
                        .Text("SCAN TO VERIFY")
                        .Bold()
                        .FontSize(6)
                        .FontColor(FlashIdTheme.DeepGreen);
                });
            });
    }

    private static void ComposeFooter(IContainer container)
    {
        container
            .BorderTop(1)
            .BorderColor(FlashIdTheme.BorderGrey)
            .PaddingTop(10)
            .Row(row =>
            {
                row.RelativeItem()
                    .Text("Generated securely by FlashID")
                    .FontSize(8)
                    .FontColor(FlashIdTheme.MutedText);

                row.RelativeItem()
                    .AlignRight()
                    .Text("Prove yourself in a flash.")
                    .FontSize(8)
                    .FontColor(FlashIdTheme.PrimaryGreen);
            });
    }

    private static void AddField(ColumnDescriptor column, string label, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return;

        column.Item().Column(field =>
        {
            field.Item()
                .Text(label)
                .Bold()
                .FontSize(8)
                .FontColor(FlashIdTheme.MutedText);

            field.Item()
                .PaddingTop(2)
                .Text(value)
                .FontSize(11)
                .FontColor(FlashIdTheme.TextPrimary);
        });
    }

    private static void AddTwoFields(ColumnDescriptor column, string leftLabel, string? leftValue, string rightLabel, string? rightValue)
    {
        column.Item().Row(row =>
        {
            row.RelativeItem().Column(left =>
            {
                if (!string.IsNullOrWhiteSpace(leftValue))
                {
                    left.Item()
                        .Text(leftLabel)
                        .Bold()
                        .FontSize(8)
                        .FontColor(FlashIdTheme.MutedText);

                    left.Item()
                        .PaddingTop(2)
                        .Text(leftValue)
                        .FontSize(11)
                        .FontColor(FlashIdTheme.TextPrimary);
                }
            });

            row.ConstantItem(20);

            row.RelativeItem().Column(right =>
            {
                if (!string.IsNullOrWhiteSpace(rightValue))
                {
                    right.Item()
                        .Text(rightLabel)
                        .Bold()
                        .FontSize(8)
                        .FontColor(FlashIdTheme.MutedText);

                    right.Item()
                        .PaddingTop(2)
                        .Text(rightValue)
                        .FontSize(11)
                        .FontColor(FlashIdTheme.TextPrimary);
                }
            });
        });
    }

    private static string FormatDate(DateTime date)
    {
        return date.ToString("dd MMMM yyyy", CultureInfo.InvariantCulture);
    }

    private static string FormatDate(DateTime? date)
    {
        return date?.ToString("dd MMMM yyyy", CultureInfo.InvariantCulture) ?? string.Empty;
    }
}
namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IFieldCryptoProvider
{
    string Encrypt(string plaintext, string context);
    string Decrypt(string ciphertext, string context);
}

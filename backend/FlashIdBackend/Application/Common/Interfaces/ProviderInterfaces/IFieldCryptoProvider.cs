namespace Application.Common.Interfaces.ProviderInterfaces;

public interface IFieldCryptoProvider
{
    string Encrypt(string plaintext);
    string Decrypt(string ciphertext);
}
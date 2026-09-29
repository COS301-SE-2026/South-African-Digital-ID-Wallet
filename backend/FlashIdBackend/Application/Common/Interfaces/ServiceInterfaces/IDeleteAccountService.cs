namespace Application.Common.Interfaces.ServiceInterfaces;

public interface IDeleteAccountService
{
    Task DeleteAccountAsync(Guid userId);
}
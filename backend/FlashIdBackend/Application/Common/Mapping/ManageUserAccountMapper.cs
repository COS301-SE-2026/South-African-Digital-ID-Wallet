using Application.Features.ManageUserAccount.DTOs;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Application.Common.Mapping;

[Mapper]
public partial class ManageUserAccountMapper
{
    [MapperIgnoreSource(nameof(Citizen.SaId))]
    [MapperIgnoreSource(nameof(Citizen.Names))]
    [MapperIgnoreSource(nameof(Citizen.Surname))]
    [MapperIgnoreSource(nameof(Citizen.Gender))]
    [MapperIgnoreSource(nameof(Citizen.ActivatedAt))]
    [MapperIgnoreSource(nameof(Citizen.Activations))]
    [MapperIgnoreSource(nameof(Citizen.UserId))]
    [MapperIgnoreSource(nameof(Citizen.User))]
    [MapperIgnoreSource(nameof(Citizen.Credentials))]
    [MapperIgnoreSource(nameof(Citizen.Id))]
    [MapperIgnoreSource(nameof(Citizen.UpdatedAt))]
    [MapperIgnoreTarget(nameof(ManageUserAccountDto.FullName))]
    [MapperIgnoreTarget(nameof(ManageUserAccountDto.IdEnding))]
    [MapperIgnoreTarget(nameof(ManageUserAccountDto.EmailAddress))]
    [MapperIgnoreTarget(nameof(ManageUserAccountDto.PhoneNumber))]
    [MapperIgnoreTarget(nameof(ManageUserAccountDto.LastLogin))]
    [MapProperty(nameof(Citizen.Status), nameof(ManageUserAccountDto.AccountStatus))]
    [MapProperty(nameof(Citizen.CreatedAt), nameof(ManageUserAccountDto.MemberSince))]
    public partial ManageUserAccountDto CitizenToManageUserAccountDto(Citizen citizen);
}
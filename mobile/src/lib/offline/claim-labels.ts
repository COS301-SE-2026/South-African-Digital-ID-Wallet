// The one table of offline claims, per credential type: which claims it may carry and the label each
// shows under. Labels match QrFieldDefinitions, so an offline result reads exactly like an online one,
// and the share page, the verifier and the result screen all read these same entries.
export const CLAIM_LABELS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  'urn:flashid:identity-document:1': {
    portrait: 'Photograph',
    date_of_birth: 'Date of birth',
    identity_number: 'Identity number',
    surname: 'Full surname',
    forenames: 'Full forenames',
    citizenship_status: 'Citizenship status',
    gender: 'Gender',
    country_of_birth: 'Country of birth',
    card_issue_date_and_number: 'Card issue date and number',
  },
  'urn:flashid:drivers-license:1': {
    portrait: 'Photo',
    expiry_date: 'Expiry date',
    date_of_birth: 'Date of birth',
    full_name: 'Full name',
    identity_number: 'SA ID number',
    license_number: 'License number',
    license_code: 'License code',
    country_of_issue: 'Country of issue',
    vehicle_restrictions: 'Vehicle restrictions',
    issue_date: 'Date of issue',
  },
}

// Labels the share page offers that never travel offline. D-011: the handwritten signature image.
export const LABELS_NOT_OFFLINE: ReadonlySet<string> = new Set(['Signature'])

// Looked up per credential type, so a label from the other type (Photograph on a licence) is refused.
export const claimNameFor = (vct: string, label: string): string | undefined =>
  Object.entries(CLAIM_LABELS[vct] ?? {}).find(
    ([, claimLabel]) => claimLabel === label
  )?.[0]

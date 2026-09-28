import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Platform, View } from 'react-native'

import FlashidEmergency from '@/../modules/flashid-emergency'
import { Button, Text } from '@/components/atoms'
import { FieldToggleRow, TextField } from '@/components/molecules'
import { DetailScreen } from '@/components/templates'
import {
  useEmergencyDeviceStatus,
  useEmergencyProfile,
  useRegisterEmergencyDevice,
} from '@/hooks'
import type {
  EmergencyFieldKey,
  EmergencyOfflineKey,
  EmergencyProfile,
  SaveEmergencyProfileRequest,
} from '@/services'

type MedicalFieldKey = Exclude<EmergencyFieldKey, 'name'>

type ContactDraft = {
  email: string
  name: string
  phone: string
  relationship: string
}

type Draft = {
  consentGiven: boolean
  contacts: ContactDraft[]
  fields: Record<MedicalFieldKey, string>
  isEnabled: boolean
  offlineFields: EmergencyOfflineKey[]
}

const MAX_CONTACTS = 3

const MEDICAL_FIELDS: { key: MedicalFieldKey; label: string }[] = [
  { key: 'bloodType', label: 'Blood type' },
  { key: 'allergies', label: 'Severe allergies' },
  { key: 'medication', label: 'Blood thinners & chronic medication' },
  { key: 'conditions', label: 'Medical conditions' },
  { key: 'implants', label: 'Implanted devices' },
  { key: 'communication', label: 'Communication needs' },
  { key: 'medicalAidScheme', label: 'Medical aid scheme' },
  { key: 'medicalAidNumber', label: 'Medical aid number' },
]

const EMPTY_CONTACT: ContactDraft = {
  email: '',
  name: '',
  phone: '',
  relationship: '',
}

const toDraft = (profile?: EmergencyProfile): Draft => ({
  consentGiven: Boolean(profile?.consentGivenAt),
  contacts: (profile?.contacts ?? []).map((contact) => ({
    email: contact.email ?? '',
    name: contact.name,
    phone: contact.phone ?? '',
    relationship: contact.relationship,
  })),
  fields: Object.fromEntries(
    MEDICAL_FIELDS.map(({ key }) => [key, profile?.fields[key] ?? ''])
  ) as Record<MedicalFieldKey, string>,
  isEnabled: profile?.isEnabled ?? false,
  offlineFields: profile?.offlineFields ?? [],
})

export const toSaveRequest = (draft: Draft): SaveEmergencyProfileRequest => {
  const fields = Object.fromEntries(
    MEDICAL_FIELDS.map(({ key }) => [key, draft.fields[key].trim()]).filter(
      ([, value]) => value.length > 0
    )
  ) as Partial<Record<MedicalFieldKey, string>>

  return {
    consentGiven: draft.consentGiven,
    contacts: draft.contacts
      .filter((contact) => contact.name.trim().length > 0)
      .map((contact, index) => ({
        email: contact.email.trim() || null,
        name: contact.name.trim(),
        phone: contact.phone.trim() || null,
        priority: index + 1,
        relationship: contact.relationship.trim(),
      })),
    fields,
    isEnabled: draft.isEnabled,
    offlineFields: draft.offlineFields.filter((key) => {
      if (key === 'name') {
        return true
      }
      if (key === 'contacts') {
        return draft.contacts.some((contact) => contact.name.trim().length > 0)
      }
      return Boolean(fields[key])
    }),
  }
}

export const validateDraft = (draft: Draft): string | null => {
  if (draft.isEnabled && !draft.consentGiven) {
    return 'Give consent before you switch on your emergency profile.'
  }
  const named = draft.contacts.filter((contact) => contact.name.trim())
  if (named.some((contact) => !contact.relationship.trim())) {
    return 'Add how each emergency contact is related to you.'
  }
  if (named.some((contact) => !contact.phone.trim() && !contact.email.trim())) {
    return 'Add a phone number or email for each emergency contact.'
  }
  return null
}

export const LockScreenSection = ({ isEnabled }: { isEnabled: boolean }) => {
  const { isChecking, isConfigured } = useEmergencyDeviceStatus()
  const { error, isRegistering, register } = useRegisterEmergencyDevice()
  const [tileHint, setTileHint] = useState(false)

  const addTile = async () => {
    const added = await FlashidEmergency.requestAddTile()
    setTileHint(!added)
  }

  return (
    <View className="gap-3" testID="emergency-lock-screen">
      <Text variant="h4" className="text-text-primary">
        Lock-screen button
      </Text>
      {!isEnabled ? (
        <Text variant="caption" className="text-text-muted">
          Switch on and save your emergency profile to set up the lock-screen
          button.
        </Text>
      ) : isChecking ? null : isConfigured ? (
        <>
          <Text variant="caption" className="text-text-muted">
            This phone is set up. Add FlashID Emergency to Quick Settings so a
            paramedic can open your code without unlocking your phone.
          </Text>
          <Button
            label="Add to Quick Settings"
            onPress={() => void addTile()}
            testID="emergency-add-tile"
            variant="secondary"
          />
        </>
      ) : (
        <Button
          isLoading={isRegistering}
          label="Set up lock-screen button"
          onPress={() =>
            register(undefined, { onSuccess: () => void addTile() })
          }
          testID="emergency-register-device"
        />
      )}
      {tileHint ? (
        <Text variant="caption" className="text-text-muted">
          Swipe down twice, tap the pencil icon and drag FlashID Emergency into
          your Quick Settings tiles.
        </Text>
      ) : null}
      {error ? (
        <Text variant="caption" className="text-danger-red">
          This phone could not be set up. Check your connection and try again.
        </Text>
      ) : null}
    </View>
  )
}

export const EmergencyProfilePage = () => {
  const router = useRouter()
  const { isLoading, isSaving, loadError, profile, save, saveError } =
    useEmergencyProfile()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const current = draft ?? toDraft(profile)

  const update = (changes: Partial<Draft>) => {
    setIsSaved(false)
    setDraft({ ...current, ...changes })
  }

  const setField = (key: MedicalFieldKey, value: string) =>
    update({ fields: { ...current.fields, [key]: value } })

  const setOffline = (key: EmergencyOfflineKey, isOn: boolean) =>
    update({
      offlineFields: isOn
        ? [...current.offlineFields.filter((item) => item !== key), key]
        : current.offlineFields.filter((item) => item !== key),
    })

  const setContact = (index: number, changes: Partial<ContactDraft>) =>
    update({
      contacts: current.contacts.map((contact, i) =>
        i === index ? { ...contact, ...changes } : contact
      ),
    })

  const onSave = async () => {
    const problem = validateDraft(current)
    setFormError(problem)
    if (problem) {
      return
    }
    try {
      await save(toSaveRequest(current))
      setDraft(null)
      setIsSaved(true)
    } catch {
      setIsSaved(false)
    }
  }

  return (
    <DetailScreen
      action={
        <Button
          disabled={isLoading}
          isLoading={isSaving}
          label="Save emergency profile"
          onPress={() => void onSave()}
          testID="emergency-save"
        />
      }
      onBack={() => router.back()}
      testID="emergency-profile-page"
      title="Emergency profile"
    >
      {isLoading ? (
        <Text className="text-text-muted">Loading your emergency profile…</Text>
      ) : loadError ? (
        <Text className="text-danger-red" testID="emergency-load-error">
          Your emergency profile could not be loaded. Check your connection and
          try again.
        </Text>
      ) : (
        <>
          <Text variant="caption" className="text-text-muted">
            In an emergency, a verified paramedic, doctor or police officer can
            scan a code from your locked phone to see the details below. You are
            notified every time it is opened.
          </Text>

          <View className="gap-3">
            <FieldToggleRow
              isOn={current.isEnabled}
              label="Emergency profile on"
              onToggle={(isEnabled) => update({ isEnabled })}
              testID="emergency-enabled"
            />
            <FieldToggleRow
              isOn={current.consentGiven}
              label="I consent to sharing my medical details in an emergency"
              onToggle={(consentGiven) => update({ consentGiven })}
              testID="emergency-consent"
            />
          </View>

          <View className="gap-4">
            <Text variant="h4" className="text-text-primary">
              Medical details
            </Text>
            <FieldToggleRow
              isOn={current.offlineFields.includes('name')}
              label="Show my name when there is no signal"
              onToggle={(isOn) => setOffline('name', isOn)}
              testID="emergency-offline-name"
            />
            {MEDICAL_FIELDS.map(({ key, label }) => (
              <View className="gap-2" key={key}>
                <TextField
                  label={label}
                  onChangeText={(value) => setField(key, value)}
                  testID={`emergency-field-${key}`}
                  value={current.fields[key]}
                />
                {current.fields[key].trim() ? (
                  <FieldToggleRow
                    isOn={current.offlineFields.includes(key)}
                    label="Also available with no signal"
                    onToggle={(isOn) => setOffline(key, isOn)}
                    testID={`emergency-offline-${key}`}
                  />
                ) : null}
              </View>
            ))}
          </View>

          <View className="gap-4">
            <Text variant="h4" className="text-text-primary">
              Emergency contacts
            </Text>
            {current.contacts.map((contact, index) => (
              <View
                className="gap-2 rounded-2xl border border-border-grey p-4"
                key={index}
                testID={`emergency-contact-${index}`}
              >
                <TextField
                  label="Name"
                  onChangeText={(name) => setContact(index, { name })}
                  testID={`emergency-contact-${index}-name`}
                  value={contact.name}
                />
                <TextField
                  label="Relationship"
                  onChangeText={(relationship) =>
                    setContact(index, { relationship })
                  }
                  testID={`emergency-contact-${index}-relationship`}
                  value={contact.relationship}
                />
                <TextField
                  keyboardType="phone-pad"
                  label="Phone"
                  onChangeText={(phone) => setContact(index, { phone })}
                  testID={`emergency-contact-${index}-phone`}
                  value={contact.phone}
                />
                <TextField
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email"
                  onChangeText={(email) => setContact(index, { email })}
                  testID={`emergency-contact-${index}-email`}
                  value={contact.email}
                />
                <Button
                  label="Remove contact"
                  onPress={() =>
                    update({
                      contacts: current.contacts.filter((_, i) => i !== index),
                    })
                  }
                  testID={`emergency-contact-${index}-remove`}
                  variant="text"
                />
              </View>
            ))}
            {current.contacts.length > 0 ? (
              <FieldToggleRow
                isOn={current.offlineFields.includes('contacts')}
                label="Show my contacts when there is no signal"
                onToggle={(isOn) => setOffline('contacts', isOn)}
                testID="emergency-offline-contacts"
              />
            ) : null}
            {current.contacts.length < MAX_CONTACTS ? (
              <Button
                label="Add emergency contact"
                onPress={() =>
                  update({ contacts: [...current.contacts, EMPTY_CONTACT] })
                }
                testID="emergency-add-contact"
                variant="secondary"
              />
            ) : null}
          </View>

          {Platform.OS === 'android' ? (
            <LockScreenSection isEnabled={Boolean(profile?.isEnabled)} />
          ) : null}

          {formError ? (
            <Text className="text-danger-red" testID="emergency-form-error">
              {formError}
            </Text>
          ) : saveError ? (
            <Text className="text-danger-red" testID="emergency-save-error">
              Your emergency profile could not be saved. Check your connection
              and try again.
            </Text>
          ) : isSaved ? (
            <Text className="text-primary-green" testID="emergency-saved">
              Emergency profile saved.
            </Text>
          ) : null}
        </>
      )}
    </DetailScreen>
  )
}

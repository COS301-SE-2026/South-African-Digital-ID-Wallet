import { useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Card } from '@/components/atoms/Card'
import {
  useQrDisclosureStore,
  CredentialType,
} from '@/stores/qrDisclosureStore'
import qrService from '@/services/qr-service/qr-service'
import { CredentialSummary } from '@/services/qr-service/types'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { typography } from '@/theme/typography'

export default function CredentialsListScreen() {
  const router = useRouter()
  const setSelection = useQrDisclosureStore((state) => state.setSelection)

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [credentials, setCredentials] = useState<CredentialSummary[]>([])

  useEffect(() => {
    qrService
      .getMine()
      .then((result) => {
        setCredentials(result)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const handleSelect = (credential: CredentialSummary) => {
    const credentialType: CredentialType =
      credential.credentialType === 'Identity Document'
        ? 'identityDocument'
        : 'driversLicense'

    setSelection({
      credentialId: credential.id,
      credentialType,
      mandatoryFields: [],
      selectedOptionalFields: [],
    })

    router.push('/qr/select-fields')
  }

  if (status === 'loading') {
    return (
      <View style={styles.screen}>
        <Text style={styles.message}>Loading your credentials...</Text>
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View style={styles.screen}>
        <Text style={styles.message}>Could not load your credentials.</Text>
      </View>
    )
  }

  if (credentials.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.message}>You have no active credentials.</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Your credentials</Text>
      <FlatList
        data={credentials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleSelect(item)}>
            <Card style={styles.row}>
              <Text style={styles.rowLabel}>{item.credentialType}</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </Card>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
})

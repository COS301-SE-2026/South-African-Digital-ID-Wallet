import { useState } from 'react'
import { Filter, Search } from 'lucide-react-native'
import { RefreshControl, ScrollView, View } from 'react-native'

import { Text } from '@/components/atoms'
import { IconButton, SegmentedTabs, TextField } from '@/components/molecules'
import type { SegmentedTabOption } from '@/components/molecules'
import { AuditLogFilterSheet, AuditLogList } from '@/components/organisms'
import { WalletScreen } from '@/components/templates'
import { useAuditLog } from '@/hooks'
import type { AuditLogOutcomeFilter } from '@/services/audit-log-service'
import { colors } from '@/theme/colors'

const OUTCOMES: SegmentedTabOption[] = [
  { label: 'All', name: 'all' },
  { label: 'Success', name: 'Success' },
  { label: 'Failed', name: 'Failed' },
  { label: 'Access', name: 'Access' },
]

export const AuditLogPage = () => {
  const {
    action,
    actions,
    entries,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    outcome,
    refetch,
    search,
    setAction,
    setOutcome,
    setSearch,
    totalCount,
  } = useAuditLog()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <WalletScreen
      action={
        <IconButton
          accessibilityLabel="Filter by action"
          color={colors.textPrimary}
          Icon={Filter}
          onPress={() => setIsFilterOpen(true)}
          testID="audit-log-filter-button"
        />
      }
      subtitle="Every action recorded at your institution."
      testID="audit-log-page"
      title="Audit Log"
    >
      <View className="gap-4">
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          LeftIcon={Search}
          onChangeText={setSearch}
          placeholder="Search name, ID number or action"
          testID="audit-log-search"
          value={search}
        />

        <SegmentedTabs
          activeName={outcome}
          onChange={(name) => setOutcome(name as AuditLogOutcomeFilter)}
          options={OUTCOMES}
          testID="audit-log-tabs"
          variant="underline"
        />
      </View>

      <ScrollView
        className="mt-4"
        contentContainerClassName="pb-10 gap-3"
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.primaryGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {!isPending && !isError ? (
          <Text variant="caption" testID="audit-log-count">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'}
          </Text>
        ) : null}

        <AuditLogList
          entries={entries}
          hasNextPage={Boolean(hasNextPage)}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onLoadMore={() => void fetchNextPage()}
        />
      </ScrollView>

      <AuditLogFilterSheet
        action={action}
        actions={actions}
        isVisible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelect={setAction}
      />
    </WalletScreen>
  )
}

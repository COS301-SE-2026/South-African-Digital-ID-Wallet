import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const SAFE_AREA_FRAME = { x: 0, y: 0, width: 390, height: 844 }
const SAFE_AREA_INSETS = { bottom: 34, left: 0, right: 0, top: 47 }
const DEVICE_METRICS = {
  frame: SAFE_AREA_FRAME,
  insets: SAFE_AREA_INSETS,
}

export const createTestQueryClient = () => {
  const queryClientConfig = {
    defaultOptions: { queries: { gcTime: 0, retry: false } },
  }
  return new QueryClient(queryClientConfig)
}

export const renderWithProviders = (
  component: ReactElement,
  queryClient: QueryClient = createTestQueryClient()
) => {
  const renderWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={DEVICE_METRICS}>
          {children}
        </SafeAreaProvider>
      </QueryClientProvider>
    )
  }
  return render(component, { wrapper: renderWrapper })
}

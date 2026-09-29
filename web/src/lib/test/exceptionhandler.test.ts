import { AxiosError, type AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import { handleApiError } from '@/lib/exceptionhandler'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}))

const mockedToast = toast as unknown as { error: jest.Mock }

const axiosErrorWith = (data: unknown) => {
  const error = new AxiosError('Request failed')
  error.response = {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: {} },
  } as AxiosResponse
  return error
}

describe('handleApiError', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should prefer details from axios response', () => {
    handleApiError(
      axiosErrorWith({ detail: 'SA ID already registered.', title: 'Conflict' })
    )
    expect(mockedToast.error).toHaveBeenCalledWith('SA ID already registered.')
  })

  it('Should fall back to message when detail is not there', () => {
    handleApiError(axiosErrorWith({ message: 'From message', title: 'Title' }))
    expect(mockedToast.error).toHaveBeenCalledWith('From message')
  })

  it('Should use generic fallback', () => {
    handleApiError(axiosErrorWith({ status: 500 }))
    expect(mockedToast.error).toHaveBeenCalledWith(
      'Something went wrong, please try again.'
    )
  })

  it('Should accept a bare object', () => {
    handleApiError({ detail: 'Direct problem details' })
    expect(mockedToast.error).toHaveBeenCalledWith('Direct problem details')
  })

  it.each([[new Error('something')], [null], ['a string'], [undefined], [42]])(
    'Should report an unexpected error',
    (input) => {
      handleApiError(input)
      expect(mockedToast.error).toHaveBeenCalledWith(
        'An unexpected error occurred.'
      )
    }
  )
})

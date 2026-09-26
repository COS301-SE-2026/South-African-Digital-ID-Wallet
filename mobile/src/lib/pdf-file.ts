import { File, Paths } from 'expo-file-system'
import { startActivityAsync } from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

const PDF_MIME_TYPE = 'application/pdf'
const PDF_UTI = 'com.adobe.pdf'
const ANDROID_VIEW_ACTION = 'android.intent.action.VIEW'
const FLAG_GRANT_READ_URI_PERMISSION = 1

export const savePdf = (bytes: Uint8Array, fileName: string): File => {
  const file = new File(Paths.cache, fileName)
  if (file.exists) {
    file.delete()
  }
  file.create()
  file.write(bytes)
  return file
}

const sharePdf = async (file: File): Promise<void> => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.')
  }
  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Certified copy',
    mimeType: PDF_MIME_TYPE,
    UTI: PDF_UTI,
  })
}

export const openPdf = async (file: File): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await startActivityAsync(ANDROID_VIEW_ACTION, {
        data: file.contentUri,
        flags: FLAG_GRANT_READ_URI_PERMISSION,
        type: PDF_MIME_TYPE,
      })
      return
    } catch {}
  }
  await sharePdf(file)
}

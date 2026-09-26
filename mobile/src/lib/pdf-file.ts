import { Directory, File, Paths } from 'expo-file-system'
import { startActivityAsync } from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

const PDF_MIME_TYPE = 'application/pdf'
const PDF_UTI = 'com.adobe.pdf'
const ANDROID_VIEW_ACTION = 'android.intent.action.VIEW'
const FLAG_GRANT_READ_URI_PERMISSION = 1
const CERTIFIED_COPY_DIRECTORY = 'certified-copies'

const certifiedCopyDirectory = () =>
  new Directory(Paths.cache, CERTIFIED_COPY_DIRECTORY)

export const clearCertifiedCopies = (): void => {
  const directory = certifiedCopyDirectory()
  if (directory.exists) {
    directory.delete()
  }
}

export const savePdf = (bytes: Uint8Array, fileName: string): File => {
  clearCertifiedCopies()
  const directory = certifiedCopyDirectory()
  directory.create({ idempotent: true, intermediates: true })
  const file = new File(directory, fileName)
  file.create()
  file.write(bytes)
  return file
}

export const deletePdf = (file: File): void => {
  if (file.exists) {
    file.delete()
  }
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
    } catch (error) {
      console.warn('No PDF viewer, falling back to share', error)
    }
  }
  await sharePdf(file)
}

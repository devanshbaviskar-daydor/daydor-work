import type { DocumentsData } from '@/types/documents'

/**
 * Data-fetching contract for the Documents screen. A real implementation
 * (backed by the HTTP API once it exists) can replace MockDocumentsSource
 * without any change to the components that consume it.
 */
export interface DocumentsSource {
  getDocuments(): Promise<DocumentsData>
}

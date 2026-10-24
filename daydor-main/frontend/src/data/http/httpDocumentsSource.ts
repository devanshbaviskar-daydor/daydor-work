import type { DocumentsSource } from '@/data/documentsSource'
import type { DocumentsData } from '@/types/documents'
import { http } from '@/data/http/httpClient'

export class HttpDocumentsSource implements DocumentsSource {
  getDocuments(): Promise<DocumentsData> {
    return http.get<DocumentsData>('/views/documents')
  }
}

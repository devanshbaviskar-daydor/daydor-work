export type DocumentCategory = 'payslip' | 'filing' | 'offer-letter' | 'policy' | 'employee-record' | 'receipt'

export type RetentionClass = 'statutory-7y' | 'statutory-8y' | 'duration-of-employment' | 'duration-plus-3y' | 'indefinite'

export interface Document {
  id: string
  title: string
  category: DocumentCategory
  ownerEmployeeId: string | null
  relatedEntityType: string
  relatedEntityId: string
  createdAt: string
  /** Absent when the signed-in role may not read the retention policies. */
  retentionClass?: RetentionClass
}

export interface DocumentsData {
  documents: Document[]
}


export enum AppView {
  LOGIN = 'LOGIN',
  MODULE_SELECTION = 'MODULE_SELECTION',
  DASHBOARD = 'DASHBOARD',
  FINANCIAL_MANAGEMENT = 'FINANCIAL_MANAGEMENT'
}

export enum SidebarMenu {
  REIMBURSEMENT = 'REIMBURSEMENT',
  ALL_APPROVALS = 'ALL_APPROVALS',
  // Financial Management lifecycle
  INVOICE_HUB = 'INVOICE_HUB',
  SYNC_TO_MYOB = 'SYNC_TO_MYOB',
  SYNC_TO_MYOB_LEASING = 'SYNC_TO_MYOB_LEASING',
  SYNC_TO_MYOB_REIMBURSEMENT = 'SYNC_TO_MYOB_REIMBURSEMENT',
  TOLL_HUB = 'TOLL_HUB',
  PDF_SPLITTER = 'PDF_SPLITTER',
  OCR_WORKBENCH = 'OCR_WORKBENCH',
  REPORTS_CENTER = 'REPORTS_CENTER',
}

export enum ConfirmationStatus {
  NOT_RECOGNIZED = 'Not Recognized',
  RECOGNIZING = 'Recognizing',
  TO_BE_CONFIRMED = 'To be Confirmed',
  PARTIALLY_CONFIRMED = 'Partially Confirmed',
  CONFIRMED = 'Confirmed'
}

export enum SyncStatus {
  NOT_SYNCED = 'Not Synced',
  SYNCING = 'Syncing',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

export enum ReimbursementStatus {
  DRAFT = 'Draft',
  PROCESSING = 'Processing',
  REIMBURSING = 'Reimbursing',
  REIMBURSED = 'Reimbursed',
  REJECTED = 'Rejected',
  SYNCED = 'Synced'
}

export interface ProcessingBatch {
  id: string;
  fileName: string;
  subFileName?: string;
  pages: number;
  confirmationStatus: ConfirmationStatus;
  syncStatus: SyncStatus;
  ocrProgress?: number;
  date: string;
  isSplit?: boolean;
  parentId?: string;
  selectedMonth?: string;
  selectedYear?: string;
}

export interface ReimbursementItem {
  requestNo: string;
  status: ReimbursementStatus;
  requester?: string;
  department: string;
  createdDate: string;
  submittedDate: string;
  invoiceDate: string;
  totalAmount: number;
  currencyType: string;
  currentApprover?: string;
}

export interface OcrResult {
  id: string;
  fileName: string;
  account: 'Ally' | 'DDT' | 'Grandline';
  invoiceNo: string;
  supplierInvoiceNo: string;
  myobCardName: string;
  status: 'Pending' | 'Ready' | 'Synced' | 'Failed';
  fields: {
    name: string;
    value: string;
    category: string;
    confidence: number;
  }[];
}

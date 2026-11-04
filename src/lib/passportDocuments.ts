/**
 * Donor Passport Document Management & Verification Services
 * Supports PDF, JPG, PNG document uploads, client-side validation,
 * document preview, progress simulation, and medical officer verification.
 */

export type DocumentType = 'govt_id' | 'blood_group_report' | 'previous_donation_proof';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export type DonorDocument = {
  id: string;
  donorId: string;
  donorName: string;
  docType: DocumentType;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // 'application/pdf' | 'image/jpeg' | 'image/png'
  fileDataUrl: string; // Base64 Data URL or public storage URL
  uploadedAt: string;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
};

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  govt_id: 'Government Photo ID (Aadhaar / Voter ID / Driving License)',
  blood_group_report: 'Official Blood Group Diagnostic Certificate',
  previous_donation_proof: 'Previous Blood Bank Donation Card / Certificate',
};

const STORAGE_KEY = 'blood_bridge_donor_documents_v1';

// Seed demo document so initial view shows a realistic active record
const SEED_DOCUMENTS: DonorDocument[] = [
  {
    id: 'doc-seed-01',
    donorId: 'donor-sample-01',
    donorName: 'Rahul Deshmukh',
    docType: 'govt_id',
    fileName: 'aadhaar_card_front.jpg',
    fileSize: 1.2 * 1024 * 1024,
    fileType: 'image/jpeg',
    fileDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%230f172a"/><rect x="10" y="10" width="380" height="240" rx="12" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><circle cx="60" cy="80" r="30" fill="%230ea5e9"/><rect x="110" y="55" width="160" height="14" rx="4" fill="%23f8fafc"/><rect x="110" y="80" width="120" height="10" rx="4" fill="%2394a3b8"/><rect x="110" y="100" width="140" height="10" rx="4" fill="%2394a3b8"/><rect x="30" y="160" width="340" height="30" rx="6" fill="%230f172a"/><text x="40" y="180" fill="%2338bdf8" font-size="12" font-family="monospace">XXXX XXXX 8912 - SOLAPUR, MH</text><text x="40" y="225" fill="%234ade80" font-size="12" font-weight="bold">GOVERNMENT OF INDIA - VERIFIED</text></svg>',
    uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'verified',
    verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedBy: 'Dr. S. Kulkarni (Medical Officer, Solapur)',
  },
  {
    id: 'doc-seed-02',
    donorId: 'donor-sample-01',
    donorName: 'Rahul Deshmukh',
    docType: 'blood_group_report',
    fileName: 'blood_typing_lab_report.pdf',
    fileSize: 840 * 1024,
    fileType: 'application/pdf',
    fileDataUrl: '',
    uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'pending',
  },
];

export function validateDocumentFile(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      ok: false,
      error: 'Invalid file type. Only PDF, JPG, and PNG files are accepted.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { ok: true };
}

export function getStoredDocuments(): DonorDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredDocuments(SEED_DOCUMENTS);
      return SEED_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error('Failed to read documents from storage:', err);
  }
  return SEED_DOCUMENTS;
}

export function saveStoredDocuments(docs: DonorDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents to storage:', err);
  }
}

export function addDonorDocument(newDoc: DonorDocument): void {
  const current = getStoredDocuments();
  const updated = [newDoc, ...current];
  saveStoredDocuments(updated);
}

export function updateDocumentStatus(
  docId: string,
  status: DocumentStatus,
  reviewerName?: string,
  reason?: string
): void {
  const current = getStoredDocuments();
  const updated = current.map((doc) => {
    if (doc.id === docId) {
      return {
        ...doc,
        status,
        verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
        verifiedBy: status === 'verified' ? reviewerName || 'Authorized Medical Officer' : undefined,
        rejectionReason: status === 'rejected' ? reason || 'Unclear or invalid document.' : undefined,
      };
    }
    return doc;
  });
  saveStoredDocuments(updated);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

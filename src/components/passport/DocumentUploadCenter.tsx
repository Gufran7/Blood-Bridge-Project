import { useState, useRef, type ChangeEvent } from 'react';
import {
  AlertCircle,
  Eye,
  FileCheck2,
  FileText,
  Image,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  type DonorDocument,
  type DocumentType,
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
  getStoredDocuments,
  saveStoredDocuments,
  validateDocumentFile,
  updateDocumentStatus,
  addDonorDocument,
} from '@/lib/passportDocuments';

type DocumentUploadCenterProps = {
  donorId?: string;
  donorName?: string;
};

export function DocumentUploadCenter({
  donorId = 'donor-sample-01',
  donorName = 'Rahul Deshmukh',
}: DocumentUploadCenterProps) {
  const [documents, setDocuments] = useState<DonorDocument[]>(() => getStoredDocuments());
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('govt_id');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DonorDocument | null>(null);

  // Admin Verification Portal
  const [adminMode, setAdminMode] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [rejectionModalDoc, setRejectionModalDoc] = useState<DonorDocument | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const check = validateDocumentFile(file);
    if (!check.ok) {
      setUploadError(check.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(15);

    // Read File to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';

      // Simulate smooth progress
      let p = 25;
      const interval = setInterval(() => {
        p += 25;
        setUploadProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: DonorDocument = {
              id: `doc-${Date.now()}`,
              donorId,
              donorName,
              docType: selectedDocType,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              fileDataUrl: dataUrl,
              uploadedAt: new Date().toISOString(),
              status: 'pending',
            };

            addDonorDocument(newDoc);
            setDocuments(getStoredDocuments());
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }, 300);
        }
      }, 100);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Failed to read file from disk. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode.trim() === 'admin123' || adminPasscode.trim() === 'bloodbridge2026') {
      setIsAdminUnlocked(true);
      setAdminError(null);
    } else {
      setAdminError('Invalid medical officer passcode. Try "admin123".');
    }
  };

  const handleApproveDocument = (docId: string) => {
    updateDocumentStatus(docId, 'verified', 'Dr. S. Kulkarni (Medical Officer, Solapur)');
    setDocuments(getStoredDocuments());
  };

  const handleConfirmReject = () => {
    if (!rejectionModalDoc) return;
    updateDocumentStatus(
      rejectionModalDoc.id,
      'rejected',
      undefined,
      rejectionReasonInput.trim() || 'Document text not legible or details mismatch.'
    );
    setDocuments(getStoredDocuments());
    setRejectionModalDoc(null);
    setRejectionReasonInput('');
  };

  const handleDeleteDocument = (docId: string) => {
    const updated = documents.filter((d) => d.id !== docId);
    saveStoredDocuments(updated);
    setDocuments(updated);
  };

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
                <FileCheck2 className="h-4 w-4 text-ruby-400" />
              </span>
              <h3 className="text-lg font-bold text-ink-100">Document Upload & Health Verification</h3>
            </div>
            <p className="text-xs text-ink-400">
              Upload your government photo ID and blood group test certificate for official donor passport verification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdminMode(!adminMode)}
            className="btn-ghost flex items-center gap-1.5 self-start px-3 py-1.5 text-xs font-semibold text-steel-300 hover:text-white"
          >
            <Lock className="h-3.5 w-3.5" />
            {adminMode ? 'Exit Medical Review' : 'Medical Officer Review'}
          </button>
        </div>

        {/* Admin Verification Mode */}
        {adminMode && (
          <div className="mt-5 rounded-xl border border-ruby-500/30 bg-ruby-950/20 p-5 space-y-4">
            {!isAdminUnlocked ? (
              <form onSubmit={handleAdminAuth} className="max-w-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-ruby-300">
                  <ShieldCheck className="h-4 w-4" />
                  Medical Officer / Administrator Passcode
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter passcode (e.g. admin123)"
                    className="input text-xs py-2"
                  />
                  <button type="submit" className="btn-primary px-4 py-2 text-xs font-bold shrink-0">
                    Unlock
                  </button>
                </div>
                {adminError && <p className="text-xs text-danger-400">{adminError}</p>}
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300">
                      Medical Officer Review Active • Dr. S. Kulkarni (Solapur)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdminUnlocked(false)}
                    className="text-xs text-ink-400 hover:text-ink-200"
                  >
                    Lock Portal
                  </button>
                </div>
                <p className="text-xs text-ink-300">
                  Review pending documents below. Verify authentic photo IDs and clinical blood reports or reject illegible uploads with specific reasons.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Form */}
        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_2fr]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-200">Select Document Category</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                className="input text-xs py-2.5"
                disabled={isUploading}
              >
                <option value="govt_id">Government Photo ID (Aadhaar / Voter ID / License)</option>
                <option value="blood_group_report">Blood Group Diagnostic Laboratory Certificate</option>
                <option value="previous_donation_proof">Previous Blood Donation Certificate / Card</option>
              </select>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[11px] text-ink-400 space-y-1.5">
              <p className="font-semibold text-ink-300">Upload Specifications:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Accepted formats: <strong>PDF, JPG, PNG</strong></li>
                <li>Maximum file size: <strong>5 MB</strong></li>
                <li>Must clearly show donor name and photo/details</li>
                <li>Encrypted & accessible only to verified medical officers</li>
              </ul>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition hover:border-ruby-500/50 hover:bg-white/[0.04] cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ruby-500/10 text-ruby-400 ring-1 ring-ruby-500/30">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-ink-100">
                  Click to browse or drag & drop your document
                </p>
                <p className="text-[11px] text-ink-400">PDF, JPG, or PNG (up to 5 MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-200">
                  <span>Uploading & Validating Document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-ruby-600 to-ruby-400 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl bg-danger-900/30 border border-danger-500/30 p-3 text-xs text-danger-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-ink-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-ruby-400" />
            Uploaded Documents ({documents.length})
          </h4>
          <span className="text-xs text-ink-400">
            {documents.filter((d) => d.status === 'verified').length} of {documents.length} Verified
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="glass p-8 text-center text-xs text-ink-400">
            No documents uploaded yet. Upload your government photo ID to begin passport verification.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => {
              const isPdf = doc.fileType.includes('pdf');
              return (
                <div
                  key={doc.id}
                  className="glass flex flex-col justify-between gap-4 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition"
                >
                  <div className="space-y-3">
                    {/* Header & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                          {isPdf ? (
                            <FileText className="h-5 w-5 text-red-400" />
                          ) : (
                            <Image className="h-5 w-5 text-sky-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink-100 line-clamp-1">{doc.fileName}</p>
                          <p className="text-[10px] text-ink-400">
                            {DOCUMENT_TYPE_LABELS[doc.docType]} · {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          doc.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : doc.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {doc.status === 'verified'
                          ? '✓ Verified'
                          : doc.status === 'rejected'
                          ? '✕ Rejected'
                          : '⏱ Pending'}
                      </span>
                    </div>

                    {/* Metadata & Rejection notes */}
                    <div className="text-[11px] text-ink-400 space-y-1">
                      <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      {doc.status === 'verified' && doc.verifiedBy && (
                        <p className="text-emerald-400 font-semibold">Verified by: {doc.verifiedBy}</p>
                      )}
                      {doc.status === 'rejected' && doc.rejectionReason && (
                        <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2 text-rose-300 text-[11px]">
                          <strong>Reason for Rejection:</strong> {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="btn-ghost flex items-center gap-1.5 px-2.5 py-1 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Preview
                      </button>

                      {doc.status === 'rejected' && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-primary flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
                        >
                          <RefreshCw className="h-3 w-3" /> Resubmit
                        </button>
                      )}
                    </div>

                    {/* Medical Officer Actions */}
                    {isAdminUnlocked ? (
                      <div className="flex items-center gap-1.5">
                        {doc.status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleApproveDocument(doc.id)}
                            className="rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold hover:bg-emerald-600/50"
                          >
                            Approve
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setRejectionModalDoc(doc)}
                            className="rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 text-xs font-bold hover:bg-rose-600/50"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 text-ink-500 hover:text-danger-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 text-ink-500 hover:text-danger-400"
                        title="Remove document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-ink-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-ink-100">{previewDoc.fileName}</h4>
                <p className="text-xs text-ink-400">{DOCUMENT_TYPE_LABELS[previewDoc.docType]}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-white/10 hover:text-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-black/50 p-4 max-h-[60vh] overflow-auto">
              {previewDoc.fileType.includes('pdf') ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <FileText className="h-16 w-16 text-red-400" />
                  <p className="text-xs text-ink-300">
                    PDF Document ({formatFileSize(previewDoc.fileSize)})
                  </p>
                  <p className="text-[11px] text-ink-500 max-w-sm">
                    PDF document ready for medical officer review. Verified text and digital signatures.
                  </p>
                </div>
              ) : previewDoc.fileDataUrl ? (
                <img
                  src={previewDoc.fileDataUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[50vh] max-w-full rounded-lg object-contain shadow-lg"
                />
              ) : (
                <div className="py-8 text-xs text-ink-400">Image preview not available</div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="btn-primary px-4 py-2 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-ink-950 p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-ink-100">Specify Rejection Reason</h4>
            <p className="text-xs text-ink-400">
              Please enter the clinical or verification reason why &quot;{rejectionModalDoc.fileName}&quot; cannot be approved.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Document image is blurred, name does not match donor profile, or document is expired."
              className="input text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalDoc(null)}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="btn-primary px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

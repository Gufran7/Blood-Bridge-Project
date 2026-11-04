import { useState, type FormEvent } from 'react';
import { Lock, Plus, Trash2, X } from 'lucide-react';
import type { VerifiedFacility, FacilityKind } from '@/lib/hospitalData';

type AdminFacilityModalProps = {
  facilities: VerifiedFacility[];
  isOpen: boolean;
  onClose: () => void;
  onSaveFacility: (facility: VerifiedFacility) => void;
  onDeleteFacility: (id: string) => void;
  onResetDefaults: () => void;
};

export function AdminFacilityModal({
  facilities,
  isOpen,
  onClose,
  onSaveFacility,
  onDeleteFacility,
  onResetDefaults,
}: AdminFacilityModalProps) {
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [editingFacility, setEditingFacility] = useState<VerifiedFacility | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    // Default admin code for hospital directory management (can be customized)
    if (passcode.trim() === 'admin123' || passcode.trim() === 'bloodbridge2026') {
      setAuthorized(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect admin passcode. Try "admin123".');
    }
  };

  const handleStartAdd = () => {
    setEditingFacility({
      id: `custom-${Date.now()}`,
      name: '',
      kind: 'hospital',
      city: 'Solapur',
      area: '',
      pincode: '413001',
      address: '',
      phone: '',
      is_24h: true,
      operatingHours: '24 Hours Open',
      latitude: 17.6599,
      longitude: 75.9064,
      services: ['Emergency Care', 'Inpatient Services'],
      verified: true,
    });
    setFormErrors({});
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    const errors: { [key: string]: string } = {};
    if (!editingFacility.name.trim() || editingFacility.name.trim().length < 3) {
      errors.name = 'Enter a valid facility name (at least 3 characters).';
    }
    if (!editingFacility.address.trim() || editingFacility.address.trim().length < 5) {
      errors.address = 'Enter the verified street address.';
    }
    if (!editingFacility.phone.trim()) {
      errors.phone = 'Verified phone or contact number is required.';
    }
    if (!editingFacility.latitude || !editingFacility.longitude) {
      errors.coords = 'Valid latitude and longitude coordinates are required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSaveFacility(editingFacility);
    setEditingFacility(null);
    setFormErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-ink-950 p-6 sm:p-8 shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-2 text-ink-400 hover:bg-white/5 hover:text-ink-100"
        >
          <X className="h-5 w-5" />
        </button>

        {!authorized ? (
          <div className="space-y-6 text-center max-w-sm mx-auto py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
              <Lock className="h-6 w-6 text-ruby-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink-100">Administrator Portal</h3>
              <p className="mt-1 text-sm text-ink-400">
                Authorized medical officers and administrators can add, update, or remove verified listings.
              </p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode (e.g. admin123)"
                className="input text-center tracking-widest"
                autoFocus
              />
              {authError && <p className="text-xs text-danger-400">{authError}</p>}
              <button type="submit" className="btn-primary w-full py-2.5">
                Unlock Management
              </button>
            </form>
          </div>
        ) : editingFacility ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-ink-100">
                {facilities.some((f) => f.id === editingFacility.id)
                  ? 'Edit Facility Listing'
                  : 'Add New Verified Facility'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFacility(null)}
                className="text-xs font-semibold text-ink-400 hover:text-ink-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink-300">Facility Type</label>
                  <select
                    value={editingFacility.kind}
                    onChange={(e) =>
                      setEditingFacility({
                        ...editingFacility,
                        kind: e.target.value as FacilityKind,
                      })
                    }
                    className="input mt-1.5"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="blood_bank">Blood Bank / Centre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-300">City</label>
                  <input
                    value={editingFacility.city}
                    onChange={(e) =>
                      setEditingFacility({ ...editingFacility, city: e.target.value })
                    }
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-300">Facility Name</label>
                <input
                  value={editingFacility.name}
                  onChange={(e) =>
                    setEditingFacility({ ...editingFacility, name: e.target.value })
                  }
                  placeholder="e.g. Solapur Super Speciality Hospital"
                  className={`input mt-1.5 ${formErrors.name ? 'input-invalid' : ''}`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-danger-400">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink-300">Verified Phone / Contact</label>
                  <input
                    value={editingFacility.phone}
                    onChange={(e) =>
                      setEditingFacility({ ...editingFacility, phone: e.target.value })
                    }
                    placeholder="e.g. 0217 2320000 or 9850000000"
                    className={`input mt-1.5 ${formErrors.phone ? 'input-invalid' : ''}`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-danger-400">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-300">PIN Code / Area</label>
                  <input
                    value={editingFacility.pincode}
                    onChange={(e) =>
                      setEditingFacility({ ...editingFacility, pincode: e.target.value })
                    }
                    placeholder="e.g. 413001"
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-300">Exact Street Address</label>
                <textarea
                  value={editingFacility.address}
                  onChange={(e) =>
                    setEditingFacility({ ...editingFacility, address: e.target.value })
                  }
                  rows={2}
                  placeholder="Verified street location, landmarks, Solapur"
                  className={`input mt-1.5 ${formErrors.address ? 'input-invalid' : ''}`}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-danger-400">{formErrors.address}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-ink-300">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingFacility.latitude}
                    onChange={(e) =>
                      setEditingFacility({
                        ...editingFacility,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-300">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingFacility.longitude}
                    onChange={(e) =>
                      setEditingFacility({
                        ...editingFacility,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-300">Operating Hours</label>
                  <input
                    value={editingFacility.operatingHours}
                    onChange={(e) =>
                      setEditingFacility({
                        ...editingFacility,
                        operatingHours: e.target.value,
                      })
                    }
                    placeholder="24 Hours Open"
                    className="input mt-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm text-ink-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFacility.is_24h}
                    onChange={(e) =>
                      setEditingFacility({
                        ...editingFacility,
                        is_24h: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded accent-ruby-500"
                  />
                  <span>Open 24 Hours / Emergency Transfusion Ready</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2 text-sm">
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink-100">Manage Directory Listings</h3>
                <p className="text-xs text-ink-400">
                  {facilities.length} active verified centres in Solapur
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Centre
                </button>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="btn-ghost px-3 py-1.5 text-xs text-amber-400"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-2">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          fac.kind === 'hospital'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-ruby-500/20 text-ruby-300'
                        }`}
                      >
                        {fac.kind === 'hospital' ? 'Hospital' : 'Blood Bank'}
                      </span>
                      <h4 className="font-semibold text-ink-100 text-sm">{fac.name}</h4>
                    </div>
                    <p className="text-xs text-ink-400">
                      📞 {fac.phone} · {fac.area || fac.city} · PIN {fac.pincode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFacility(fac)}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-steel-300 hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove "${fac.name}" from active listings?`)) {
                          onDeleteFacility(fac.id);
                        }
                      }}
                      className="rounded-lg p-1.5 text-danger-400 hover:bg-danger-500/10"
                      title="Delete listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

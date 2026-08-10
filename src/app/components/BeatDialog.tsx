import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useData } from '../context/DataContext';
import type { Beat } from '../context/DataContext';
import { toast } from 'sonner';

interface BeatDialogProps {
  onClose: () => void;
  /** Passed when editing an existing beat; omitted when adding a new one. */
  beat?: Beat | null;
}

export function BeatDialog({ onClose, beat }: BeatDialogProps) {
  const { beats, addBeat, updateBeat } = useData();
  const isEdit = Boolean(beat);

  const [name, setName] = useState(beat?.name ?? '');
  const [area, setArea] = useState(beat?.area === '—' ? '' : beat?.area ?? '');
  const [status, setStatus] = useState<Beat['status']>(beat?.status ?? 'Active');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Beat name is required.');
      return;
    }
    const clashes = beats.some(
      b => b.id !== beat?.id && b.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (clashes) {
      setError(`"${trimmed}" already exists in this LBNP.`);
      return;
    }

    if (isEdit && beat) {
      updateBeat(beat.id, {
        name: trimmed,
        area: area.trim() || '—',
        status,
      });
      toast.success(`Beat "${trimmed}" updated.`);
    } else {
      addBeat({
        name: trimmed,
        // Codes are system-generated; they are not user-editable.
        code: `BT-${String(beats.length + 1).padStart(3, '0')}`,
        area: area.trim() || '—',
        status,
        source: 'Manual',
      });
      toast.success(`Beat "${trimmed}" added.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <MapPin className="w-5 h-5 text-[#2D6EF5]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Edit Beat' : 'Add Beat'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isEdit
                  ? `Update the details for "${beat!.name}".`
                  : 'Add a single beat to this LBNP.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beat Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Beat 10"
              autoFocus
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent ${
                error ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="e.g. Kukatpally"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex items-center gap-6">
              {(['Active', 'Inactive'] as const).map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setStatus(option)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    status === option
                      ? 'border-[#2D6EF5] bg-white'
                      : 'border-gray-300 bg-white group-hover:border-[#2D6EF5]'
                  }`}>
                    {status === option && <div className="w-2 h-2 rounded-full bg-[#2D6EF5]" />}
                  </div>
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#2D6EF5] hover:bg-[#2D6EF5]/90 text-white">
            {isEdit ? 'Save Changes' : 'Add Beat'}
          </Button>
        </div>
      </div>
    </div>
  );
}

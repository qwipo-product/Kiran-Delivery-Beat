import { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from './ui/button';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';

interface UploadBeatsDialogProps {
  onClose: () => void;
  /** Fired after a successful import, so the list can jump to the new beats. */
  onImported?: () => void;
}

type RowStatus = 'Ready' | 'Duplicate' | 'Invalid';

interface ParsedRow {
  row: number;
  name: string;
  area: string;
  status: RowStatus;
  reason?: string;
}

/** Header lookup that tolerates casing, spacing and underscores. */
function pick(record: Record<string, unknown>, ...candidates: string[]) {
  const normalise = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
  const wanted = candidates.map(normalise);
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(normalise(key))) return String(value ?? '').trim();
  }
  return '';
}

export function UploadBeatsDialog({ onClose, onImported }: UploadBeatsDialogProps) {
  const { beats, addBeats } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const readyRows = rows.filter(r => r.status === 'Ready');

  const handleDownloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet([
      { 'Beat Name': 'Beat 10', Area: 'Kukatpally' },
      { 'Beat Name': 'Beat 11', Area: 'Madhapur' },
    ]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Beats');
    XLSX.writeFile(book, 'beats-upload-template.xlsx');
    toast.success('Template downloaded.');
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    setParseError('');
    setRows([]);

    const reader = new FileReader();
    reader.onerror = () => setParseError('Could not read that file. Please try again.');
    reader.onload = event => {
      try {
        const book = XLSX.read(event.target?.result, { type: 'array' });
        const firstSheet = book.Sheets[book.SheetNames[0]];
        if (!firstSheet) {
          setParseError('That workbook has no sheets.');
          return;
        }

        const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
          defval: '',
        });
        if (records.length === 0) {
          setParseError('No rows found. Make sure the first row contains column headers.');
          return;
        }

        const existingNames = new Set(beats.map(b => b.name.toLowerCase()));
        const seenInFile = new Set<string>();

        const parsed: ParsedRow[] = records.map((record, index) => {
          const name = pick(record, 'Beat Name', 'Beat', 'Name');
          const area = pick(record, 'Area', 'Zone', 'Locality');
          const rowNumber = index + 2; // +1 for the header row, +1 for 1-based rows

          if (!name) {
            return { row: rowNumber, name: '', area, status: 'Invalid', reason: 'Beat name is empty' };
          }
          const key = name.toLowerCase();
          if (existingNames.has(key)) {
            return { row: rowNumber, name, area, status: 'Duplicate', reason: 'Already in this LBNP' };
          }
          if (seenInFile.has(key)) {
            return { row: rowNumber, name, area, status: 'Duplicate', reason: 'Repeated in this file' };
          }
          seenInFile.add(key);
          return { row: rowNumber, name, area, status: 'Ready' };
        });

        setRows(parsed);
        if (!parsed.some(r => r.status === 'Ready')) {
          setParseError('No new beats to import — every row is a duplicate or invalid.');
        }
      } catch {
        setParseError('That file could not be parsed. Upload a .xlsx, .xls or .csv file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (readyRows.length === 0) return;
    addBeats(
      readyRows.map((r, i) => ({
        name: r.name,
        // Codes are system-generated; the upload file does not carry them.
        code: `BT-${String(beats.length + i + 1).padStart(3, '0')}`,
        area: r.area || '—',
        source: 'Excel' as const,
      }))
    );
    toast.success(`${readyRows.length} beat${readyRows.length === 1 ? '' : 's'} imported.`);
    onImported?.();
    onClose();
  };

  const skipped = rows.length - readyRows.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileSpreadsheet className="w-5 h-5 text-[#2D6EF5]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Beats</h2>
              <p className="mt-1 text-sm text-gray-600">
                Import beat names in bulk from an Excel or CSV file.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Template */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Not sure about the format?</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Columns: <strong>Beat Name</strong> (required), Area.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-md text-sm text-[#2D6EF5] font-medium hover:bg-blue-50 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download template
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) parseFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-[#2D6EF5] bg-blue-50' : 'border-gray-300 hover:border-[#2D6EF5]'
            }`}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-700">
              <span className="text-[#2D6EF5] font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">.xlsx, .xls or .csv</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) parseFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Selected file */}
          {fileName && (
            <div className="flex items-center justify-between mt-3 px-3 py-2 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{fileName}</span>
              </div>
              <button
                onClick={() => {
                  setFileName('');
                  setRows([]);
                  setParseError('');
                }}
                className="text-gray-400 hover:text-red-600 flex-shrink-0"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {parseError && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{parseError}</p>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
                <span className="flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {readyRows.length} ready
                </span>
                {skipped > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {skipped} skipped
                  </span>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Beat Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Area</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {rows.map(row => (
                        <tr key={row.row} className={row.status === 'Ready' ? '' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-sm text-gray-500">{row.row}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{row.name || <span className="text-gray-400">—</span>}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{row.area || '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              row.status === 'Ready'
                                ? 'bg-green-100 text-green-700'
                                : row.status === 'Duplicate'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : 'bg-red-100 text-red-600'
                            }`}>
                              {row.status}
                            </span>
                            {row.reason && (
                              <span className="ml-2 text-xs text-gray-500">{row.reason}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={readyRows.length === 0}
            className="bg-[#2D6EF5] hover:bg-[#2D6EF5]/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            Import {readyRows.length > 0 ? `${readyRows.length} beat${readyRows.length === 1 ? '' : 's'}` : 'beats'}
          </Button>
        </div>
      </div>
    </div>
  );
}

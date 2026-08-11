import { useState } from 'react';
import { Search, Plus, Upload, Pencil, Trash2, Layers, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../Pagination';
import { BeatDialog } from '../BeatDialog';
import { UploadBeatsDialog } from '../UploadBeatsDialog';
import { useData } from '../../context/DataContext';
import type { Beat, Cluster } from '../../context/DataContext';

/* ─────────────────────────────────────────────
   Beats — Settings > Beats
───────────────────────────────────────────── */
export function BeatsPanel() {
  const { beats, clusters, deleteBeat } = useData();
  const [beatSearch, setBeatSearch] = useState('');
  const [showBeatDialog, setShowBeatDialog] = useState(false);
  const [beatToEdit, setBeatToEdit] = useState<Beat | null>(null);
  const [showUploadBeats, setShowUploadBeats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const openBeatDialog = (beat?: Beat) => {
    setBeatToEdit(beat ?? null);
    setShowBeatDialog(true);
  };

  const closeBeatDialog = () => {
    setShowBeatDialog(false);
    setBeatToEdit(null);
  };

  const clusterNameForBeat = (beatId: string) =>
    clusters.find(c => c.beatIds.includes(beatId))?.name;

  const filteredBeats = beats.filter(b => {
    const q = beatSearch.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBeats = filteredBeats.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteBeat = (id: string, name: string) => {
    const owner = clusterNameForBeat(id);
    const warning = owner
      ? `"${name}" is part of the ${owner} cluster and will be removed from it. Continue?`
      : `Delete beat "${name}"?`;
    if (confirm(warning)) {
      deleteBeat(id);
      toast.success(`Beat "${name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Beats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadBeats(true)}
              className="h-9 px-4 flex items-center gap-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              Upload Excel
            </button>
            <button
              onClick={() => openBeatDialog()}
              className="h-9 px-4 flex items-center gap-1.5 bg-[#2D6EF5] text-white rounded-md text-sm font-medium hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Beat
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          The beats available in this LBNP. Add them one at a time or import a list from Excel.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search beats by name or area..."
            value={beatSearch}
            onChange={e => {
              setBeatSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {['Beat Name', 'Area', 'Cluster', 'Status', 'Actions'].map(label => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBeats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      No beats found. Add one manually or upload an Excel file.
                    </td>
                  </tr>
                )}
                {currentBeats.map(beat => {
                  const cluster = clusterNameForBeat(beat.id);
                  return (
                    <tr key={beat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{beat.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{beat.area}</td>
                      <td className="px-4 py-3">
                        {cluster ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                            {cluster}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          beat.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {beat.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openBeatDialog(beat)}
                            className="p-1 text-gray-400 hover:text-[#2D6EF5] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBeat(beat.id, beat.name)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredBeats.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={n => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {showBeatDialog && <BeatDialog beat={beatToEdit} onClose={closeBeatDialog} />}
      {showUploadBeats && <UploadBeatsDialog onClose={() => setShowUploadBeats(false)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Clusters — Settings > Clusters
───────────────────────────────────────────── */
interface ClustersPanelProps {
  onNavigateToAddCluster: (cluster?: Cluster) => void;
}

export function ClustersPanel({ onNavigateToAddCluster }: ClustersPanelProps) {
  const { beats, clusters, vehicles, deleteCluster } = useData();
  const [clusterSearch, setClusterSearch] = useState('');

  const filteredClusters = clusters.filter(c => {
    const q = clusterSearch.toLowerCase();
    const vehicle = vehicles.find(v => v.id === c.vehicleId);
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (vehicle?.vehicleNumber.toLowerCase().includes(q) ?? false)
    );
  });

  const handleDeleteCluster = (cluster: Cluster) => {
    if (confirm(`Delete cluster "${cluster.name}"? Its beats will become available again.`)) {
      deleteCluster(cluster.id);
      toast.success(`Cluster "${cluster.name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Clusters</h2>
          <button
            onClick={() => onNavigateToAddCluster()}
            className="h-9 px-4 flex items-center gap-1.5 bg-[#2D6EF5] text-white rounded-md text-sm font-medium hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Cluster
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Group beats onto a single vehicle. The Cluster Beat Optimizer loads each vehicle only
          from the beats in its cluster.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clusters by name, code or vehicle..."
            value={clusterSearch}
            onChange={e => setClusterSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
          />
        </div>

        {filteredClusters.length === 0 ? (
          <div className="border border-gray-200 rounded-lg py-16 text-center">
            <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No clusters yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Create a cluster to keep a set of beats on one vehicle.
            </p>
            <button
              onClick={() => onNavigateToAddCluster()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6EF5] text-white rounded-md text-sm font-medium hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Cluster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredClusters.map(cluster => {
              const vehicle = vehicles.find(v => v.id === cluster.vehicleId);
              const clusterBeats = cluster.beatIds
                .map(id => beats.find(b => b.id === id))
                .filter(Boolean);
              return (
                <div key={cluster.id} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{cluster.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          cluster.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cluster.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cluster.code} &middot; created {cluster.createdDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onNavigateToAddCluster(cluster)}
                        className="p-1.5 text-gray-400 hover:text-[#2D6EF5] transition-colors"
                        title="Edit cluster"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCluster(cluster)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete cluster"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-[#2D6EF5]" />
                    </div>
                    {vehicle ? (
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {vehicle.type} &middot; {vehicle.capacityKg} kg &middot; {vehicle.driverName}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No vehicle assigned</p>
                    )}
                  </div>

                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {clusterBeats.length} beat{clusterBeats.length === 1 ? '' : 's'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {clusterBeats.map(beat => (
                      <span
                        key={beat!.id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
                      >
                        {beat!.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

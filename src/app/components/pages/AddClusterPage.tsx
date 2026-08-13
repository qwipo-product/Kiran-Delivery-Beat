import { useMemo, useState } from 'react';
import { ArrowLeft, Search, MapPin, Truck, Check, Layers, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import type { Cluster } from '../../context/DataContext';

interface AddClusterPageProps {
  onBack: () => void;
  /** Passed when editing an existing cluster; omitted when creating a new one. */
  cluster?: Cluster | null;
}

export function AddClusterPage({ onBack, cluster }: AddClusterPageProps) {
  const { beats, vehicles, clusters, addCluster, updateCluster } = useData();
  const isEdit = Boolean(cluster);

  const [name, setName] = useState(cluster?.name ?? '');
  const [code, setCode] = useState(
    cluster?.code ?? `CLU-${String(clusters.length + 1).padStart(3, '0')}`
  );
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>(cluster?.beatIds ?? []);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(cluster?.vehicleIds ?? []);
  const [beatSearch, setBeatSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);

  /* A beat belongs to exactly one cluster, so beats held by *other* clusters
     are shown but locked. Same rule for vehicles. */
  const beatOwner = useMemo(() => {
    const map = new Map<string, string>();
    clusters.forEach(c => {
      if (c.id === cluster?.id) return;
      c.beatIds.forEach(bId => map.set(bId, c.name));
    });
    return map;
  }, [clusters, cluster?.id]);

  const vehicleOwner = useMemo(() => {
    const map = new Map<string, string>();
    clusters.forEach(c => {
      if (c.id === cluster?.id) return;
      c.vehicleIds.forEach(vId => map.set(vId, c.name));
    });
    return map;
  }, [clusters, cluster?.id]);

  const filteredBeats = beats.filter(b => {
    const q = beatSearch.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q);
  });

  const filteredVehicles = vehicles.filter(v => {
    /* Vehicles out on a trip are not offered for clustering. The one already
       tagged to this cluster stays visible even if it is mid-trip, so an edit
       never silently drops the current selection. */
    if (v.status === 'On Trip' && !selectedVehicleIds.includes(v.id)) return false;

    const q = vehicleSearch.toLowerCase();
    return (
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      v.driverName.toLowerCase().includes(q)
    );
  });

  const selectableBeats = filteredBeats.filter(b => !beatOwner.has(b.id));
  const allSelectableChecked =
    selectableBeats.length > 0 && selectableBeats.every(b => selectedBeatIds.includes(b.id));

  const toggleBeat = (id: string) => {
    setSelectedBeatIds(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelectableChecked) {
      setSelectedBeatIds(prev => prev.filter(id => !selectableBeats.some(b => b.id === id)));
    } else {
      setSelectedBeatIds(prev => [
        ...new Set([...prev, ...selectableBeats.map(b => b.id)]),
      ]);
    }
  };

  const selectableVehicles = filteredVehicles.filter(
    v => !vehicleOwner.has(v.id) && v.status !== 'Inactive'
  );
  const allVehiclesChecked =
    selectableVehicles.length > 0 &&
    selectableVehicles.every(v => selectedVehicleIds.includes(v.id));

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleAllVehicles = () => {
    if (allVehiclesChecked) {
      setSelectedVehicleIds(prev => prev.filter(id => !selectableVehicles.some(v => v.id === id)));
    } else {
      setSelectedVehicleIds(prev => [...new Set([...prev, ...selectableVehicles.map(v => v.id)])]);
    }
  };

  const selectedVehicles = selectedVehicleIds
    .map(id => vehicles.find(v => v.id === id))
    .filter(Boolean) as typeof vehicles;
  const totalCapacity = selectedVehicles.reduce((sum, v) => sum + v.capacityKg, 0);

  const nameError = submitted && !name.trim();
  const beatsError = submitted && selectedBeatIds.length === 0;
  const vehicleError = submitted && selectedVehicleIds.length === 0;

  const handleSave = () => {
    setSubmitted(true);
    if (!name.trim() || selectedBeatIds.length === 0 || selectedVehicleIds.length === 0) {
      toast.error('Add a cluster name, at least one beat, and at least one vehicle.');
      return;
    }

    if (isEdit && cluster) {
      updateCluster(cluster.id, {
        name: name.trim(),
        code: code.trim(),
        beatIds: selectedBeatIds,
        vehicleIds: selectedVehicleIds,
      });
      toast.success(`"${name.trim()}" updated.`);
    } else {
      addCluster({
        name: name.trim(),
        code: code.trim(),
        beatIds: selectedBeatIds,
        vehicleIds: selectedVehicleIds,
        status: 'Active',
      });
      toast.success(`"${name.trim()}" created with ${selectedBeatIds.length} beats.`);
    }
    onBack();
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clusters
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-[#2D6EF5]" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Cluster' : 'Add Cluster'}
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Group beats together and tag a vehicle to them. The Cluster Beat Optimizer loads this
          vehicle only from the beats in its cluster.
        </p>
      </div>

      {/* Cluster details */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Cluster Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. West Hyderabad Cluster"
              className={`w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent ${
                nameError ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">Cluster name is required.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Cluster Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Beats + Vehicles */}
      <div className="flex-1 min-h-0 px-6 py-4 grid grid-cols-2 gap-4">
        {/* Beats */}
        <div className={`bg-white border rounded-lg flex flex-col min-h-0 ${
          beatsError ? 'border-red-400' : 'border-gray-200'
        }`}>
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2D6EF5]" />
                <h2 className="text-sm font-semibold text-gray-900">Select Beats</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-medium">
                  {selectedBeatIds.length} selected
                </span>
              </div>
              <button
                onClick={toggleSelectAll}
                disabled={selectableBeats.length === 0}
                className="text-xs font-medium text-[#2D6EF5] hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                {allSelectableChecked ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beats by name or area..."
                value={beatSearch}
                onChange={e => setBeatSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
            {filteredBeats.length === 0 && (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">No beats match your search.</p>
            )}
            {filteredBeats.map(beat => {
              const owner = beatOwner.get(beat.id);
              const isLocked = Boolean(owner);
              const isChecked = selectedBeatIds.includes(beat.id);
              return (
                <label
                  key={beat.id}
                  onClick={() => !isLocked && toggleBeat(beat.id)}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isLocked
                      ? 'opacity-60 cursor-not-allowed'
                      : `cursor-pointer ${isChecked ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isChecked ? 'border-[#2D6EF5] bg-[#2D6EF5]' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{beat.name}</p>
                    <p className="text-xs text-gray-500 truncate">{beat.area}</p>
                  </div>
                  {isLocked && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0">
                      In {owner}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {beatsError && (
            <div className="px-4 py-2 border-t border-red-200 bg-red-50 flex items-center gap-1.5 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <p className="text-xs text-red-600">Select at least one beat.</p>
            </div>
          )}
        </div>

        {/* Vehicles */}
        <div className={`bg-white border rounded-lg flex flex-col min-h-0 ${
          vehicleError ? 'border-red-400' : 'border-gray-200'
        }`}>
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2D6EF5]" />
                <h2 className="text-sm font-semibold text-gray-900">Select Vehicles</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-medium">
                  {selectedVehicleIds.length} selected
                </span>
              </div>
              <button
                onClick={toggleAllVehicles}
                disabled={selectableVehicles.length === 0}
                className="text-xs font-medium text-[#2D6EF5] hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                {allVehiclesChecked ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles by number, type or driver..."
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
            {filteredVehicles.length === 0 && (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">No vehicles match your search.</p>
            )}
            {filteredVehicles.map(vehicle => {
              const owner = vehicleOwner.get(vehicle.id);
              const isLocked = Boolean(owner) || vehicle.status === 'Inactive';
              const isSelected = selectedVehicleIds.includes(vehicle.id);
              return (
                <label
                  key={vehicle.id}
                  onClick={() => !isLocked && toggleVehicle(vehicle.id)}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isLocked
                      ? 'opacity-60 cursor-not-allowed'
                      : `cursor-pointer ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[#2D6EF5] bg-[#2D6EF5]' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{vehicle.vehicleNumber}</p>
                      <span className="text-xs text-gray-400">{vehicle.capacityKg} kg</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {vehicle.type} &middot; {vehicle.driverName}
                    </p>
                  </div>
                  {owner ? (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0">
                      In {owner}
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      vehicle.status === 'Available'
                        ? 'bg-green-100 text-green-700'
                        : vehicle.status === 'On Trip'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {vehicle.status}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {vehicleError && (
            <div className="px-4 py-2 border-t border-red-200 bg-red-50 flex items-center gap-1.5 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <p className="text-xs text-red-600">Select at least one vehicle.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-6 py-3 flex items-center justify-between flex-shrink-0">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{selectedBeatIds.length}</span> beat
          {selectedBeatIds.length === 1 ? '' : 's'} selected
          {selectedVehicles.length > 0 && (
            <>
              {' '}&middot;{' '}
              <span className="font-semibold text-gray-900">{selectedVehicles.length}</span>
              {' '}vehicle{selectedVehicles.length === 1 ? '' : 's'}{' '}
              <span className="text-gray-500">
                ({selectedVehicles.map(v => v.vehicleNumber).join(', ')} &middot; {totalCapacity} kg total)
              </span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#2D6EF5] text-white rounded-md text-sm font-medium hover:bg-blue-600"
          >
            {isEdit ? 'Save Changes' : 'Create Cluster'}
          </button>
        </div>
      </div>
    </div>
  );
}

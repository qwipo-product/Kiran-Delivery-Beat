import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

const statusOptions = [
  'All',
  'Ready for Planning',
  'In Planning',
  'Trip Assigned',
  'In Transit',
  'Delivered',
  'Offline Delivery',
  'Partial Return',
  'Returned',
  'Cancelled',
  'Discarded',
];

export function FiltersDialog({
  open,
  onOpenChange,
  selectedStatuses,
  onStatusChange,
}: FiltersDialogProps) {
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleClearAll = () => {
    setOrderStartDate('');
    setOrderEndDate('');
    setStatusFilter('All');
    onStatusChange([]);
  };

  const handleApply = () => {
    // Apply status filter based on dropdown selection
    if (statusFilter === 'All') {
      onStatusChange([]);
    } else {
      onStatusChange([statusFilter]);
    }
    
    // Here you would also handle date filtering if needed
    // For now, we just close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Filters</DialogTitle>
          <DialogDescription className="sr-only">Filter orders by date range and status</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderStartDate">Order Start Date</Label>
              <Input
                id="orderStartDate"
                type="date"
                value={orderStartDate}
                onChange={(e) => setOrderStartDate(e.target.value)}
                placeholder="Order Start Date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderEndDate">Order End Date</Label>
              <Input
                id="orderEndDate"
                type="date"
                value={orderEndDate}
                onChange={(e) => setOrderEndDate(e.target.value)}
                placeholder="Order End Date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button type="button" onClick={handleApply} className="bg-[#2D6EF5] hover:bg-[#2557D6]">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
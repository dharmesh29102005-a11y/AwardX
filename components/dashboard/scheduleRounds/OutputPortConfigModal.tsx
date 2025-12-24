import React, { useState, useEffect } from 'react';
import { Modal } from '../../Modal';
import { OutputPort } from '../../../types/scheduleRounds';
import { Button } from '../../Button';
import { X } from 'lucide-react';

interface OutputPortConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (port: OutputPort) => void;
  existingPort?: OutputPort;
  availableDataStreams?: string[]; // Available data streams like ['A', 'B', 'C', 'D']
}

export const OutputPortConfigModal: React.FC<OutputPortConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPort,
  availableDataStreams = [], // No default - streams come from inputs
}) => {
  const [portName, setPortName] = useState('');
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [isAllStreamsSelected, setIsAllStreamsSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingPort) {
        setPortName(existingPort.name);
        // Check if all available streams are selected (meaning "all streams" was selected)
        const allStreamsSelected = availableDataStreams.length > 0 && 
          existingPort.dataStreams.length === availableDataStreams.length &&
          availableDataStreams.every(s => existingPort.dataStreams.includes(s));
        
        setIsAllStreamsSelected(allStreamsSelected);
        
        if (allStreamsSelected) {
          // If all streams are selected, show as "all streams" selected
          setSelectedStreams([]);
        } else {
          // Only include streams that are currently available (filter out any that no longer exist)
          setSelectedStreams(existingPort.dataStreams.filter(s => availableDataStreams.includes(s)));
        }
      } else {
        setPortName('');
        setSelectedStreams([]);
        setIsAllStreamsSelected(false);
      }
    }
  }, [isOpen, existingPort, availableDataStreams]);

  const handleToggleStream = (stream: string) => {
    // If clicking on an individual stream, clear "all streams" selection
    setIsAllStreamsSelected(false);
    setSelectedStreams(prev => 
      prev.includes(stream) 
        ? prev.filter(s => s !== stream)
        : [...prev, stream]
    );
  };

  const handleToggleAllStreams = () => {
    if (isAllStreamsSelected) {
      // Deselecting "all streams"
      setIsAllStreamsSelected(false);
      setSelectedStreams([]);
    } else {
      // Selecting "all streams" - clear individual selections
      setIsAllStreamsSelected(true);
      setSelectedStreams([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portName.trim()) return;
    
    // If "all streams" is selected, use all available streams
    const streamsToSave = isAllStreamsSelected ? availableDataStreams : selectedStreams;
    
    if (streamsToSave.length === 0) return;

    const port: OutputPort = {
      id: existingPort?.id || `output-${Date.now()}`,
      name: portName.trim(),
      dataStreams: streamsToSave,
      processingLogic: existingPort?.processingLogic || { type: 'all' },
    };

    onSave(port);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingPort ? 'Edit Output Port' : 'Create Output Port'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Port Name
          </label>
          <input
            type="text"
            value={portName}
            onChange={(e) => setPortName(e.target.value)}
            placeholder="e.g., Main Output, Filtered Output"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Select Data Streams to Process
          </label>
          <p className="text-xs text-slate-500 mb-2">
            {availableDataStreams.length > 0 
              ? `Choose which data streams from the inputs this output port will process (${availableDataStreams.length} available from ${availableDataStreams.length === 1 ? 'input' : 'inputs'})`
              : 'This round has no input connections yet. Connect other rounds to this one first to make data streams available for output ports.'
            }
          </p>
          {availableDataStreams.length > 0 ? (
            <div className="space-y-3">
              {/* "All Streams" option */}
              <label
                className={`
                  flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all
                  ${isAllStreamsSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }
                  ${selectedStreams.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={isAllStreamsSelected}
                  onChange={handleToggleAllStreams}
                  disabled={selectedStreams.length > 0}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="font-medium">All Streams ({availableDataStreams.join(', ')})</span>
              </label>
              
              {/* Individual stream options */}
              <div className="grid grid-cols-2 gap-2">
                {availableDataStreams.map((stream) => (
                  <label
                    key={stream}
                    className={`
                      flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all
                      ${selectedStreams.includes(stream)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }
                      ${isAllStreamsSelected ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStreams.includes(stream)}
                      onChange={() => handleToggleStream(stream)}
                      disabled={isAllStreamsSelected}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="font-medium">Data Stream {stream}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-800">
              This round has no input connections yet. Connect other rounds to this one first to make data streams available for output ports.
            </div>
          )}
          {!isAllStreamsSelected && selectedStreams.length === 0 && availableDataStreams.length > 0 && (
            <p className="text-xs text-red-500 mt-1">Please select at least one data stream</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={!portName.trim() || (!isAllStreamsSelected && selectedStreams.length === 0)}
          >
            {existingPort ? 'Update Port' : 'Create Port'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


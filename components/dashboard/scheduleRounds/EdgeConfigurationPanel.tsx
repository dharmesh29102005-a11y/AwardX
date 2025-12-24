import React, { useState, useEffect } from 'react';
import { RoundEdge, EdgeCondition } from '../../../types/scheduleRounds';
import { X, Save, Trash2, GitBranch } from 'lucide-react';
import { Button } from '../../Button';
import { motion, AnimatePresence } from 'framer-motion';

interface EdgeConfigurationPanelProps {
    edge: RoundEdge;
    onUpdate: (edge: RoundEdge) => void;
    onDelete: () => void;
    onClose: () => void;
}

export const EdgeConfigurationPanel: React.FC<EdgeConfigurationPanelProps> = ({
    edge,
    onUpdate,
    onDelete,
    onClose,
}) => {
    const [formData, setFormData] = useState<RoundEdge>(edge);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setFormData(edge);
        setHasChanges(false);
    }, [edge]);

    const handleChange = (field: keyof RoundEdge, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleConditionChange = (condition: EdgeCondition) => {
        handleChange('condition', condition);
    };

    const handleSave = () => {
        onUpdate({
            ...formData,
        });
        setHasChanges(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-[420px] bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900">Logic Configuration</h3>
                        <p className="text-xs text-slate-500 mt-1">Configure transition logic</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <section>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Transition Logic</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Condition Type</label>
                                <select
                                    value={formData.condition.type}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        let newCondition: EdgeCondition = { type: 'always' };
                                        if (type === 'if_score_gte') newCondition = { type: 'if_score_gte', score: 0 };
                                        if (type === 'if_shortlisted') newCondition = { type: 'if_shortlisted' };
                                        if (type === 'manual_approval') newCondition = { type: 'manual_approval' };
                                        if (type === 'custom_logic') newCondition = { type: 'custom_logic', expression: '' };
                                        handleConditionChange(newCondition);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="always">Always Proceed</option>
                                    <option value="if_shortlisted">If Shortlisted</option>
                                    <option value="if_score_gte">Score Threshold</option>
                                    <option value="manual_approval">Manual Approval</option>
                                    <option value="custom_logic">Custom Logic</option>
                                </select>
                            </div>

                            {formData.condition.type === 'if_score_gte' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Minimum Score</label>
                                    <input
                                        type="number"
                                        value={formData.condition.score}
                                        onChange={(e) => handleConditionChange({ ...formData.condition, score: parseInt(e.target.value) || 0 } as any)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            )}

                            {formData.condition.type === 'custom_logic' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Logic Expression</label>
                                    <textarea
                                        value={formData.condition.expression}
                                        onChange={(e) => handleConditionChange({ ...formData.condition, expression: e.target.value } as any)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                        rows={4}
                                        placeholder="e.g. score > 80 && status == 'approved'"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Enter a valid boolean expression.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Connection
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

            </motion.div>
        </AnimatePresence>
    );
};

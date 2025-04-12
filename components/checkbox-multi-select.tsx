import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// Assuming you have these components from shadcn/ui
// If not, they can be implemented separately

interface Banker {
  id: string;
  full_name: string;
  bank_name: string;
}

interface CheckboxMultiSelectProps {
  options: Banker[];
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  maxHeight?: string;
}

const CheckboxMultiSelect: React.FC<CheckboxMultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  maxHeight = "200px"
}) => {
  const handleToggle = (id: string) => {
    const newSelectedValues = selectedValues.includes(id)
      ? selectedValues.filter((v) => v !== id) // Deselect
      : [...selectedValues, id]; // Select

    onChange(newSelectedValues); // Update the selected values
  };

  const selectedNames = selectedValues
    .map((value) => {
      const option = options.find((option) => option.id === value);
      return option ? option.full_name : null;
    })
    .filter((name) => name !== null)
    .join(", ");

  const selectAll = () => {
    const allIds = options.map(option => option.id);
    onChange(allIds); // Select all bankers
  };

  const deselectAll = () => {
    onChange([]); // Clear all selections
  };

  return (
    <div className="border rounded-md">
      <div className="flex justify-between p-2 border-b">
        <span className="font-medium">Select Bankers</span>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            type="button"
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deselectAll}
            type="button"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <ScrollArea className={`p-2`} style={{ maxHeight }}>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded">
              <Checkbox
                id={`banker-${option.id}`}
                checked={selectedValues.includes(String(option.id))}// This ensures the checkbox is checked if the ID is in selectedValues
                onCheckedChange={() => handleToggle(option.id)} // Toggle on click
              />
              <label 
                htmlFor={`banker-${option.id}`}
                className="flex-1 text-sm font-medium cursor-pointer"
              >
                {option.full_name} <span className="text-muted-foreground">({option.bank_name})</span>
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {selectedValues.length > 0 && (
        <div className="p-2 border-t text-sm text-muted-foreground">
          Selected: {selectedNames}
        </div>
      )}
    </div>
  );
};


export default CheckboxMultiSelect;
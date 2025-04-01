"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  acceptedFileTypes?: string[]
  maxFileSizeMB?: number
  multiple?: boolean
}

export function FileUploader({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFileSizeMB = 10,
  multiple = false
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateFiles = (files: File[]): File[] => {
    return Array.from(files).filter(file => {
      // Check file type
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
      const isValidType = acceptedFileTypes.includes(fileExt)
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload ${acceptedFileTypes.join(', ')} files.`,
          variant: "destructive",
        })
        return false
      }
      
      // Check file size
      const isValidSize = file.size <= maxFileSizeMB * 1024 * 1024
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of ${maxFileSizeMB}MB.`,
          variant: "destructive",
        })
        return false
      }
      
      return true
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files))
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.target.files))
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
      
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: {acceptedFileTypes.join(', ')} (Max: {maxFileSizeMB}MB)
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedFileTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInputChange}
      />
    </div>
  )
} 
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [filePresent, setFilePresent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 20 * 1024 * 1024;

  // Unified handler for both drop and file picker
  const handleFile = (file: File | null) => {
    if (!file) return;
    onFileSelect?.(file);
    setUploadedFile(file);
    setFilePresent(true);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      handleFile(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
  });

  const handleIconClick = () => {
    fileInputRef.current?.click(); // Open file picker manually
  };

  const handleManualFileSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setFilePresent(false);
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <div className="space-y-4 cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            className="hidden"
            onChange={handleManualFileSubmit}
          />

          {filePresent && uploadedFile ? (
            <div
              className="uploaded-selected-file flex flex-row justify-between p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <img src="/images/pdf.png" alt="pdf" className="size-10" />
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(uploadedFile.size)}
                  </p>
                </div>
                <button
                  className="p-2 cursor-pointer"
                  onClick={handleRemoveFile}
                >
                  <img
                    src="/icons/cross.svg"
                    alt="remove"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div onClick={handleIconClick}>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-3">
                <img src="/icons/info.svg" alt="upload" className="size-20" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload </span>
                OR Drag & Drop
              </p>
              <p className="text-lg text-gray-500">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

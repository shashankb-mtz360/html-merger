import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import logo from '../../assets/download.png'
import add from '../../assets/add.png'
import style from './MyDropZone.module.css'
function MyDropzone ({ onDataChange }) {
  const [files, setFiles] = useState([])
  const onDrop = useCallback(
    async acceptedFiles => {
      if (acceptedFiles?.length) {
        try {
          // Read each HTML file content
          setFiles(preFiles => [...preFiles, ...acceptedFiles])
          onDataChange(prevFiles => [...prevFiles, ...acceptedFiles])
        } catch (error) {
          console.error('Error merging HTML files:', error)
        }
      }
    },
    [onDataChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()} className={style.dropzone}>
      <input {...getInputProps()} />
      {files.length === 0 ? (
        <p className={style.Input}>
          Drag 'n' drop some .html files here, or click to upload.
        </p>
      ) : (
        <p style={{ display: 'none' }}>
          Files exist, so this paragraph is hidden.
        </p>
      )}

      <ul className={style.uploadBox}>
        {files.length !== 0 ? (
          <>
            {files.map(file => (
              <div key={file.name} className={style.item}>
                <img src={logo} alt='Logo' width={50} height={50} />
                <div className={style.fileName}>{file.name}</div>
              </div>
            ))}
            <img src={add} alt='Logo' className={style.AddButton} />
          </>
        ) : (
          <></>
        )}
      </ul>
    </div>
  )
}
export default MyDropzone

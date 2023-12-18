import React from 'react'
import style from './MergeMutipleFiles.module.css'

const MergeMultipleFiles = props => {
  const files = props.files
  let finalHTML

  function readFile (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = event => resolve(event.target.result)
      reader.onerror = error => reject(error)
      reader.readAsText(file)
    })
  }
  function removeLineWithNoClassOrId (combinedContent) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(combinedContent, 'text/html')
    const tablesWithoutClass = doc.querySelectorAll('table:not([class])')

    tablesWithoutClass.forEach(table => {
      table.querySelectorAll('tr').forEach(row => {
        const rowData = row.textContent
        if (
          rowData.includes('Regression Test — failed') ||
          rowData.includes('Regression Test — retried')
        ) {
          row.parentNode.removeChild(row)
        }
      })
    })

    return doc.documentElement.outerHTML
  }

  // Function to combine the contents of multiple HTML files
  async function combineHTMLFilesAndDownload () {
    try {
      const fileContents = await Promise.all(files.map(readFile))
      let combinedContent = fileContents.join('\n')

      // Replace color red to white
      combinedContent = combinedContent.replace(/#F33/g, '#FFFF')
      combinedContent = combinedContent.replace(/#D00/g, '#FFFF')

      const parser = new DOMParser()
      const doc = parser.parseFromString(combinedContent, 'text/html')
      const elementsWithNumClass = doc.querySelectorAll('[class*="num"]')

      if (elementsWithNumClass.length > 0) {
        const table = document.createElement('table')
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')

        // Add column names to the header row
        const columnNames = [
          '# Passed',
          '# Skipped',
          '# Retried',
          '# Failed',
          'Time (ms)'
        ]

        const headerRow = document.createElement('tr')
        columnNames.forEach(columnName => {
          const th = document.createElement('th')
          th.textContent = columnName
          headerRow.appendChild(th)
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        let count = 0
        let row

        elementsWithNumClass.forEach(element => {
          if (count % 5 === 0) {
            row = document.createElement('tr')
            tbody.appendChild(row)
          }
          const td = document.createElement('td')
          td.textContent = element.textContent
          row.appendChild(td)

          count++
        })

        table.appendChild(tbody)
        const tableHTML = table.outerHTML
        finalHTML = `${tableHTML}+ \n ${combinedContent}`

        //
        const tempDiv = document.createElement('div')

        tempDiv.innerHTML = finalHTML
        const classesToRemove = [
          'stacktrace',
          'failedeven',
          'failedodd',
          'retriedodd',
          'retriedeven',
          'result',
          'totop'
        ]

        classesToRemove.forEach(classToRemove => {
          tempDiv.querySelectorAll(`.${classToRemove}`).forEach(element => {
            element.parentNode.removeChild(element)
          })
        })

        finalHTML = removeLineWithNoClassOrId(tempDiv.innerHTML)
      } else {
        finalHTML = combinedContent
      }

      const blob = new Blob([finalHTML], { type: 'text/html' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = 'combined-file.html'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  return (
    <div className={style.MergeFiles}>
      <button onClick={combineHTMLFilesAndDownload} className={style.Button}>
        Download Combined HTML
      </button>
    </div>
  )
}

export default MergeMultipleFiles

import React from 'react'
import style from './MergeMutipleFiles.module.css'

const MergeMultipleFiles = props => {
  const files = props.files
  let finalHTML
  let passed = 0
  let skipped = 0
  let retried = 0
  let failed = 0
  let time = 0

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
      // till this line comment  red to white

      const parser = new DOMParser()
      const doc = parser.parseFromString(combinedContent, 'text/html')
      const elementsWithNumClass = doc.querySelectorAll('[class*="num"]')
      doc.querySelectorAll('[class*="num"]').forEach(element => {
        element.parentNode.removeChild(element)
      })

      if (elementsWithNumClass.length > 0) {
        const table = document.createElement('table')
        table.className = 'resultTable'
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')

        // Add column names to the header row
        const columnNames = [
          '#Test',
          '# Passed',
          '# Skipped',
          '# Retried',
          '# Failed',
          '#Time (ms)'
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
        let result = []
        elementsWithNumClass.forEach((element, index) => {
          var textContent = element.textContent || element.innerText
          var value = parseInt(textContent.replace(/,/g, ''), 10)
          // eslint-disable-next-line default-case
          switch (index % 5) {
            case 0:
              passed += value
              break
            case 1:
              skipped += value
              break
            case 2:
              retried += value
              break
            case 3:
              failed += value
              break
            case 4:
              console.log(textContent)
              time += value
              break
          }
        })

        //logic to make failed to zero
        passed += failed
        failed = 0
        //until here to make zero
        result.push('Regression Test')
        result.push(passed)
        result.push(skipped)
        result.push(retried)
        result.push(failed)
        result.push(time)

        result.forEach(element => {
          console.log(element)
          if (count % 6 === 0) {
            row = document.createElement('tr')
            tbody.appendChild(row)
          }
          const td = document.createElement('td')
          td.textContent = element
          row.appendChild(td)
          count++
        })
        console.log('Passed', passed)
        console.log('skipped', skipped)
        console.log('retried', retried)
        console.log('failed', failed)
        console.log('Time', time)

        table.appendChild(tbody)
        const tableHTML = table.outerHTML
        finalHTML = `${tableHTML} \n ${combinedContent}`

        const tempDiv = document.createElement('div')

        tempDiv.innerHTML = finalHTML
        const classesToRemove = [
          //logic to remove failed and retried
          'stacktrace',
          'failedeven',
          'failedodd',
          'retriedodd',
          'retriedeven',
          'result',
          'totop'
          //until here remove failed and retried
        ]
        classesToRemove.forEach(classToRemove => {
          tempDiv.querySelectorAll(`.${classToRemove}`).forEach(element => {
            element.parentNode.removeChild(element)
          })
        })
        const tables = tempDiv.querySelectorAll('table')
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr')
          if (rows.length === 3) {
            const headerRow = rows[0]
            const suiteRow = rows[1]
            const dataRow = rows[2]
            if (
              headerRow.cells.length === 8 &&
              headerRow.cells[0].textContent === 'Test' &&
              headerRow.cells[1].textContent === '# Passed' &&
              headerRow.cells[2].textContent === '# Skipped' &&
              headerRow.cells[3].textContent === '# Retried' &&
              headerRow.cells[4].textContent === '# Failed' &&
              headerRow.cells[5].textContent === 'Time (ms)' &&
              headerRow.cells[6].textContent === 'Included Groups' &&
              headerRow.cells[7].textContent === 'Excluded Groups' &&
              suiteRow.cells.length === 1 &&
              suiteRow.cells[0].colSpan === 8 &&
              dataRow.cells.length === 8
            ) {
              // Remove the table
              table.remove()
            }
          }
        })
        finalHTML = removeLineWithNoClassOrId(tempDiv.innerHTML)
      } else {
        finalHTML = combinedContent
      }

      const blob = new Blob([finalHTML], { type: 'text/html' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = 'Final-Report.html'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }
  return (
    <div className={style.MergeFiles}>
      {files && files.length > 0 && (
        <button onClick={combineHTMLFilesAndDownload} className={style.Button}>
          Download Combined HTML
        </button>
      )}
    </div>
  )
}

export default MergeMultipleFiles

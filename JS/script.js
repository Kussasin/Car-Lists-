document.addEventListener("DOMContentLoaded", () => {

  //check regex
  function getPoleIf(idField, objectRegex) {
    var objectPole = document.querySelector(idField);
    if (!objectRegex.test(objectPole.value)) {
      return (undefined);
    } else {
      return (objectPole.value);
    }
  }

  //data input
  function inputData(idItem1, idItem2, idItem3, classItem) {
    let item = {},
      carModel = /^[a-zA-ZА-Яа-яąęóżźćĄĘÓŻŹĆ0-9]{1,20}$/,
      carYear = /^[0-9]{4}$/;

    item.brand = getPoleIf(`${idItem1}`, carModel);
    item.model = getPoleIf(`${idItem2}`, carModel);
    item.year = getPoleIf(`${idItem3}`, carYear);
    let field = [item.brand, item.model, item.year],
      temp = false,
      skip = true;
    if (classItem == '.modal__error') {
      field = [item.brand, item.year];
      skip = false;
    }

    for (let i = 0; i < field.length; i++) {
      if (field[i] == undefined) {
        document.querySelectorAll(`${classItem}`)[i].style.display = 'block';
        document.querySelector('.duplicate__error').style.display = 'none';
        temp = true;
      } else {
        document.querySelectorAll(`${classItem}`)[i].style.display = 'none';
      }
    }
    if (temp == true) {
      return;
    } else {
      let duplicateModel = false;
      for (let i = 0; i < localStorage.length; i++) {
        if (skip) {
          if (item.model === localStorage.key(i)) {
            duplicateModel = true;
          }
        }
      }
      if (duplicateModel) {
        document.querySelector('.duplicate__error').style.display = 'block';
      } else {
        localStorage.setItem(item.model, JSON.stringify(item));
        getOutTable();
        document.querySelector('.duplicate__error').style.display = 'none';
        clearInput('#brand', '#model', '#year');
      }
    }
  }

  document.querySelector('.record').addEventListener("click", () => {
    inputData('#brand', '#model', '#year', '.error__input');
  });

  //clear inputs after entering data
  function clearInput(val1, val2, val3, key = '') {
    document.querySelector(`${val1}`).value = '';
    document.querySelector(`${val2}`).value = key;
    document.querySelector(`${val3}`).value = '';
  }

  //refresh table
  function getOutTable() {
    let content = '';
    for (let i = 0; i < localStorage.length; i++) {
      let keyValue = JSON.parse(localStorage.getItem(localStorage.key(i)));
      content += `
      <tr class="table__row">
        <td class="first__col">${keyValue.brand}</td>
        <td>${keyValue.model}</td>
        <td>${keyValue.year}</td>
        <td class="last__col">
        <button type="button" class="btn buttn action del__item">
        <i class="fas fa-trash"></i></button>
        <button type="button" class="btn buttn edit__modal" data-bs-toggle="modal" data-bs-target="#exampleModal">
        <i class="fas fa-pencil-alt"></i></button>
        </td>
      </tr>`;
    }
    if (localStorage.length) {
      document.querySelector("#table").innerHTML = content;
      //subscription to events
      document.querySelectorAll('.del__item').forEach((item) => addDelSub(item));
      document.querySelectorAll('.edit__modal').forEach((editItem) => editSub(editItem));
      sortTable();
    }
  }

  getOutTable();

  //edit elements
  function editSub(editItem) {
    editItem.addEventListener('click', () => {
      let elem = editItem.parentNode.parentNode,
        elemValue = elem.childNodes[3].innerHTML;
      clearInput('#modal__brand', '#modal__model', '#modal__year', elemValue);
    });
  }

  document.querySelectorAll('.edit__modal').forEach((editItem) => editSub(editItem));
  //edit modal window
  document.querySelectorAll('.edit__item').forEach((elem) => {
    elem.addEventListener('click', () => {
      inputData('#modal__brand', '#modal__model', '#modal__year', '.modal__error');
      getOutTable();
    });
  });

  //delete item
  function addDelSub(item) {
    item.addEventListener('click', () => {
      item.parentNode.parentNode.remove();
      let elem = item.parentNode.parentNode,
        elemValue = elem.childNodes[3].innerHTML;
      localStorage.removeItem(`${elemValue}`);
      getOutTable();
    });
  }

  document.querySelectorAll('.del__item').forEach((item) => addDelSub(item));


  function sortTable() {
    const table = document.getElementById('sortable');
    const headers = table.querySelectorAll('.fa-filter');
    const tableBody = table.querySelector('tbody');
    const rows = tableBody.querySelectorAll('.table__row');

    // Sorting direction
    const directions = Array.from(headers).map(function (header) {
      return '';
    });

    // Convert the contents of a given cell to a given column
    const transform = function (index, content) {
      // Get the data type of a column
      const type = headers[index].getAttribute('data-type');
      switch (type) {
        case 'number':
          return parseFloat(content);
        case 'string':
        default:
          return content;
      }
    };

    const sortColumn = function (index) {
      // Get current direction
      const direction = directions[index] || 'asc';

      // Directional factor
      const multiplier = (direction === 'asc') ? 1 : -1;

      const newRows = Array.from(rows);

      newRows.sort(function (rowA, rowB) {
        const cellA = rowA.querySelectorAll('td')[index].innerHTML;
        const cellB = rowB.querySelectorAll('td')[index].innerHTML;

        const a = transform(index, cellA);
        const b = transform(index, cellB);

        switch (true) {
          case a > b:
            return 1 * multiplier;
          case a < b:
            return -1 * multiplier;
          case a === b:
            return 0;
        }
      });

      // Delete old lines
      [].forEach.call(rows, function (row) {
        tableBody.removeChild(row);
      });

      directions[index] = direction === 'asc' ? 'desc' : 'asc';

      //Add new lines
      newRows.forEach(function (newRow) {
        tableBody.appendChild(newRow);
      });
    };

    [].forEach.call(headers, function (header, index) {
      header.addEventListener('click', function () {
        sortColumn(index);
      });
    });

  }
  document.querySelector('#myInput').addEventListener('keyup', () => {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("sortable");
    tr = table.getElementsByTagName("tr");

    // Iterate through all the rows of the table and hide those that do not match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  });
});

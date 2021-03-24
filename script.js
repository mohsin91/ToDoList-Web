var apiBaseUrl = "http://51.81.172.193:3000/";
window.onload = function () {
  bootlint.showLintReportForCurrentDocument([], {
    hasProblems: false,
    problemFree: false
  });
  let todoListData = [];
  function AddTaskToDOM(obj) {
    if(obj.status === "archive"){
      return 0;
    }
    let _checkbox = 'fa-square-o';
    let _status = 'fa-hourglass-2';
    let _border = 'warning';
    let _html = ``;
    let _title = `Mark as complete`;
    let _dueDate = moment(obj.dueDate, 'DD/MM/YYYY', true);
    let _todayDate = moment();
    let _completeHtml = ``;

    if(obj.status === "completed"){
        _checkbox = 'fa-check-square-o';
        _status = 'fa-check';
        _border = 'success';
        _title = 'Mark as todo';
        _completeHtml = `
              <h5 class="m-0 p-0 px-2" onclick="archiveTodo('${obj._id}')">
                  <i class="fa fa-archive text-warning btn m-0 p-0" data-toggle="tooltip" data-placement="bottom" title="Archive todo"></i>
              </h5>`;
    }else if(_dueDate.isBefore(_todayDate,'day'))
    {
      _html += `<li> <b>${obj.name}</b> :: ${obj.dueDate} </li>`
      _border = 'danger';
    }
    if(_html.length > 0){
      Swal.fire({
        icon:"warning",
        toast:true,
        position: 'top-end',
        title: "Due Date has Passed",
        html: `<ul>`+_html+`</ul>`,
        showCloseButton:true,
        showConfirmButton:false,
        timer: 3000,
        timerProgressBar: true,
        closeButtonHtml:'&times;',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
    }
    var taskHtml = `<div id="t_${obj._id}" class="row px-3 align-items-center todo-item rounded">
      <div class="col-auto m-1 p-0 d-flex align-items-center">
          <h2 id='todo_${obj._id}' data-status="${obj.status}" class="m-0 p-0" onclick="toggleComplete('${obj._id}')">
              <i class="fa ${_checkbox} text-primary btn m-0 p-0" data-toggle="tooltip" data-placement="bottom" title="${_title}"></i>
          </h2>
      </div>
      <div class="col px-1 m-1 d-flex align-items-center">
          <input type="text" class="form-control form-control-lg border-0 edit-todo-input bg-transparent rounded px-3" readonly value="`+ obj.name + `" title="Buy groceries for next week" />
      </div>
      <div class="col-auto m-1 p-0 px-3" title="Due Date">
          <div class="row">
              <div id="todo_status_${obj._id}" class="col-auto d-flex align-items-center rounded bg-white border border-${_border}">
                  <i class="fa ${_status} my-2 px-2 text-${_border} btn" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Due on date"></i>
                  <h6 class="text my-2 pr-2">`+ obj.dueDate + `</h6>
              </div>
          </div>
      </div>
      <div class="col-auto m-1 p-0 px-3 d-none">
      </div>
      <div class="col-auto m-1 p-0 todo-actions">
          <div class="row d-flex align-items-center justify-content-end">
              ${_completeHtml}
              <h5 class="m-0 p-0 px-2" onclick="editTodo('${obj._id}')">
                  <i class="fa fa-pencil text-info btn m-0 p-0" data-toggle="tooltip" data-placement="bottom" title="Edit todo"></i>
              </h5>
              <h5 class="m-0 p-0 px-2" onclick="deleteTodo('${obj._id}')">
                  <i class="fa fa-trash-o text-danger btn m-0 p-0" data-toggle="tooltip" data-placement="bottom" title="Delete todo"></i>
              </h5>
          </div>
          <div class="row todo-created-info">
              <div class="col-auto d-flex align-items-center pr-2">
                  <i class="fa fa-info-circle my-2 px-2 text-black-50 btn" data-toggle="tooltip" data-placement="bottom" title="Created Date" data-original-title="Due Date"></i>
                  <label class="date-label my-2 text-black-50">`+ obj.Created_date + `</label>
              </div>
          </div>
      </div>
    </div>`;
    if(obj.status === "completed")
    {
      $('#divTodoCompleted').prepend(taskHtml);
    }
    else
    {
      $('#divTodoTasks').prepend(taskHtml);
    }
  }

  $(document).ready(function () {
    $.ajax({
      url: apiBaseUrl + "tasks",
      dataType: 'json',
      cache: false,

      beforeSend: function () {
        console.log("Loading");
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },

      success: function (data) {
        console.log('Success');
        console.log(data);

        todoListData = data.data;

        for (i = 0; i < data.data.length; i++) {
          if(data.data[i].isDeleted == false){
            AddTaskToDOM(data.data[i]);
          }
        }
      },

      done: function (data) {
        console.log('Done');
      },

      complete: function () {
        console.log('Finished all tasks');
      }
    });
  });

  $('[data-toggle="tooltip"]').tooltip();

  function formatDate(date) {
    return (
      moment(date).format("DD/MM/YYYY")
    );
  }

  var currentDate = formatDate(new Date());

  $(".due-date-button").datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    todayHighlight: true,
    startDate: currentDate,
    orientation: "bottom right"
  });

  $(".due-date-button").on("click", function (event) {
    $(".due-date-button")
      .datepicker("show")
      .on("changeDate", function (dateChangeEvent) {
        $(".due-date-button").datepicker("hide");
        $(".due-date-label").text(formatDate(dateChangeEvent.date));
      });
  });

  $("#btnAdd").on("click", function (event) {
    var name = $('#inpTask').val();
    var dueDate = $(".due-date-label").text();
    if (name === "" || dueDate === "Due date not set") {
      alert("Enter a name and a due date");
    }
    else {
      $.ajax({
        type: 'POST',
        url: apiBaseUrl + "tasks",
        data: {
          name: name,
          dueDate: dueDate
        },
        success: function (data) {
          $(".due-date-label").text('');
          $('#inpTask').val('');
          AddTaskToDOM(data);
        },
        error: function (err) {
          alert("Unexpected error");
        }
      });
    }
  });
  $("#listArchiveBtn").on('click', function (){
    console.log("Archive list - ",todoListData);
    
    let _archiveHtml = `<li class="list-group-item list-group-item-secondary d-flex align-items-center">
      <input type="checkbox" id="all" value="all" />
      <span class="flex-grow-1">  All </span>
    </li>`;

    $.each(todoListData, (i, v)=>{
      if(v.status === "archive" && v.isDeleted === false){
        _archiveHtml += `<li class="list-group-item d-flex align-items-center">
          <input type="checkbox" data-id="${v._id}" />
          <span class="flex-grow-1">  ${v.name} </span>
        </li>`;
      }
    });
    
    Swal.fire({
      title:'Archive List',
      html:'<ul class="list-group">'+_archiveHtml+'</ul>',
      showCloseButton:true,
      closeButtonHtml:'&times;',
      confirmButtonText:'UnArchive',
      didOpen: () => {
        let firstli = Swal.getPopup().querySelector("#all");
        $(firstli).on('change', () => {
          let arr = Swal.getPopup().querySelector("li");
          if($(firstli).is(':checked'))
          {
            $.each(arr, (i, e) => {
              $(e).find('input:checkbox').attr("checked","true")
            });
          }else{
            $.each(arr, (i, e) => {
              $(e).find('input:checkbox').removeAttr("checked")
            });
          }
        });
      },
      preConfirm: () => {
        let arr = $("#swal2-content > ul").children();
        let _ids = [];
        let count = 0;
        $.each(arr, (i, e) => {
          if($(e).find('input').is(":checked"))
          {
            if(i===0)
            {
              // do nothing
            }else{
              _ids.push($(e).find('input').data('id'))
            }
            count++;
          }
        });
        if(count == 0){
          Swal.showValidationMessage(`Please select one item to Un-Archive`)
        }
        return _ids
      }
    }).then(result => {
      console.log(result.value);
      for(let i=0; i < result.value.length; i++){
        unarchiveTodo(result.value[i]);
      }
      location.reload();
    });
  });
};

// functions for ajax call
function toggleComplete(id)
{
  let status = $("#todo_"+id).data('status');
  switch (status) {
    case "pending":
      status = "completed";
      break;
  
    default:
      status = "pending";
      break;
  }

  $.ajax({
    type:"PUT",
    url:apiBaseUrl+"tasks/"+id,
    data:{ status: status },
    success:function (data){
      location.reload();
    },
    error: function (err) {
      alert("Unexpected error");
    }
  });
}

function editTodo(id){
  $.ajax({
    type:"GET",
    url: apiBaseUrl+"tasks/"+id,
    success: function (data){
      let date = moment(data.dueDate, 'DD/MM/YYYY', true).format("YYYY-MM-DD");
      let minDate = moment().format("YYYY-MM-DD");
      Swal.fire({
        title:"Update",
        html:`<form>
          <input type="text" class="form-control mb-2" value="${data.name}" id="name" placeholder="Enter Item" name="item"/>
          <input type="date" class="form-control" value="${date}" min="${minDate}" id="dueDate" placeholder="Enter Date" name="dueDate" />
        </form>`,
        confirmButtonText:"Update",
        focusConfirm:false,
        preConfirm:() => {
          const name = Swal.getPopup().querySelector('#name').value
          const dueDate = Swal.getPopup().querySelector('#dueDate').value
          if (!name || !dueDate) {
            Swal.showValidationMessage(`Please enter Item and Due Date`)
          }
          return { name: name, dueDate: dueDate }
        }
      }).then(result => {
        if(result.isConfirmed){
          let data = { name: result.value.name, dueDate: moment(result.value.dueDate).format("DD/MM/YYYY") }
          $.ajax({
            type:"PUT",
            url: apiBaseUrl+"tasks/"+id,
            data:data,
            success: function (data){
              Swal.fire({ title:"Updated", text:"record Updated", icon:"success" }).then(res => location.reload());
            },
            error: function (err){
              console.log("something ent wrong",err);
            }
          })
        }

      });
    },
    error: function (error){
      alert("Unexpected error", error);
    }
  });
}

function deleteTodo(id){
  Swal.fire({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this record!",
    icon:"warning",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText:"No",
    customClass: {
    denyButton: 'btn btn-danger',
    confirmButton: 'btn btn-primary',
  }
  }).then(val => {
    if(val.isConfirmed){
      $.ajax({
        type: 'PUT',
        url: apiBaseUrl + "tasks/"+id,
        data:{ isDeleted:true },
        success: function (data) {
          Swal.fire({title:"Record Deleted", icon:"success"}).then(x => {
            location.reload();
          });
        },
        error: function (err) {
          alert("Unexpected error", err);
        }
      })
    }
  });
}

function  archiveTodo(id){
  Swal.fire({
    title: "Are you sure?",
    text: "Record will be archived!",
    icon:"warning",
    showDenyButton: true,
    confirmButtonText: `Yes`,
    denyButtonText:"No",
    customClass: {
    denyButton: 'btn btn-danger',
    confirmButton: 'btn btn-primary',
  }
  }).then(val => {
    if(val.isConfirmed){
      $.ajax({
        type: 'PUT',
        url: apiBaseUrl + "tasks/"+id,
        data:{ status: 'archive' },
        success: function (data) {
          Swal.fire({title:"Record Archived", icon:"success"}).then(x => {
            location.reload();
          });
        },
        error: function (err) {
          alert("Unexpected error", err);
        }
      })
    }
  });
}

function  unarchiveTodo(id){
  $.ajax({
    type: 'PUT',
    url: apiBaseUrl + "tasks/"+id,
    data:{ status: 'completed' },
    success: function (data) {
      console.log("unarchived", data);
    },
    error: function (err) {
      alert("Unexpected error", err);
    }
  });
}
const apikey = '15a6e6cd-6520-4e49-842f-76b148318e47';
const apihost = 'https://todo-api.coderslab.pl';


document.addEventListener('DOMContentLoaded', function () {

    function apiListTasks() {
        return fetch(apihost + '/api/tasks', {
            headers: {Authorization: apikey}
        })
            .then(
                function (resp) {
                    if (!resp.ok) {
                        alert('Wystapil blad! Otwórz zakladke devtools i zakładkę Sieć / Network - sciaganie wszystkich');
                    }
                    return resp.json();
                }
            )
    }

    apiListTasks().then(
        function (obj) {
            console.log(obj);
            obj.data.forEach(
                function (task) {
                    renderTask(task.id, task.title, task.description, task.status)
                }
            )
        }
    )

    function renderTask(id, title, description, status) {
        const section = document.createElement("section");
        section.className = "card mt-5 shadow-sm";
        document.querySelector("main").appendChild(section);
        const barDiv = document.createElement("div");
        barDiv.className = "card-header d-flex justify-content-between align-items-center";
        section.appendChild(barDiv);
        const leftDiv = document.createElement("div");
        const rightDiv = document.createElement("div");
        barDiv.append(leftDiv, rightDiv);

        const h5Title = document.createElement("h5");
        h5Title.innerText = title;
        const h6Description = document.createElement("h6");
        h6Description.innerText = description;
        h6Description.className = "card-subtitle text-muted";
        leftDiv.append(h5Title, h6Description);

        const buttonFinish = document.createElement("button");
        buttonFinish.className = "btn btn-dark btn-sm";
        buttonFinish.innerText = "Finish";
        const buttonDelete = document.createElement("button");
        buttonDelete.className = "btn btn-outline-danger btn-sm ml-2";
        buttonDelete.innerText = "Delete";
        buttonDelete.addEventListener("click", function () {
            console.log('usuwanie');
            apiDeleteTask(id);
            document.querySelector("main").removeChild(section);

        })
        rightDiv.append(buttonFinish, buttonDelete);

        const ul = document.createElement("ul");
        ul.className = "list-group list-group-flush";
        section.appendChild(ul);

        apiListOperationsForTask(id).then(function (obj) {
            obj.data.forEach(function (operation) {
                renderOperation(ul, status, operation.id, operation.description, operation.timeSpent);
            });
            console.log(obj);
        });

        const divForm = document.createElement("div");
        divForm.className = "card-body";
        section.appendChild(divForm);

        const form = document.createElement("form");
        divForm.appendChild(form);

        const divInput = document.createElement("div");
        divInput.className = "input-group";
        form.appendChild(divInput);

        input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Operation description";
        input.className = "form-control";
        input.minLength = "5";
        input.id = "operationDescription";
        divInput.appendChild(input);

        const divButton = document.createElement("div");
        divButton.className = "input-group-append";
        divInput.appendChild(divButton);

        const buttonAdd = document.createElement("button");
        buttonAdd.className = "btn btn-info";
        buttonAdd.innerText = "Add";
        divButton.appendChild(buttonAdd);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apiCreateOperationForTask(id, this.elements[0].value).then(function (obj) {
                renderOperation(ul, status, obj.data.id, obj.data.description, obj.data.timeSpent)
                console.log(obj);
            });
        })

    }

    function apiListOperationsForTask(taskId) {
        return fetch("https://todo-api.coderslab.pl/api/tasks/" + taskId + "/operations", {
            headers: {
                Authorization: apikey,
            }
        }).then(function (response) {
            if (!response.ok) {
                alert("Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny apiListOperationsForTask");
            }
            return response.json();
        });
    }


    function renderOperation(operationList, status, operationId, operationDescription, timeSpent) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        operationList.appendChild(li);

        const descriptionDiv = document.createElement("div");
        descriptionDiv.innerText = operationDescription;
        li.appendChild(descriptionDiv);

        const time = document.createElement("span");
        time.className = "badge badge-success badge-pill ml-2";
        time.innerText = convertMinToH(timeSpent);
        descriptionDiv.appendChild(time);

        if (status === "open") {
            const divButtons = document.createElement("div");
            li.appendChild(divButtons);

            const button1 = document.createElement("button");
            button1.innerText = "+15 m";
            button1.className = "btn btn-outline-success btn-sm mr-2";
            divButtons.appendChild(button1);

            const button2 = document.createElement("button");
            button2.innerText = "+1 h";
            button2.className = "btn btn-outline-success btn-sm mr-2";
            divButtons.appendChild(button2);

            const button3 = document.createElement("button");
            button3.innerText = "Delete";
            button3.className = "btn btn-outline-danger btn-sm";
            divButtons.appendChild(button3);
        }

    }

    function convertMinToH(valueInMin) {
        const h = (valueInMin / 60).toFixed(0);
        const min = (valueInMin % 60).toFixed(0);
        return h + "h " + min + "min";
    }

    function apiCreateTask(title, description) {
        return fetch(
            apihost + '/api/tasks', {
                headers: {
                    Authorization: apikey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title: title, description: description, status: 'open'}),
                method: 'POST'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert("Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny apiCreateTask");
                }
                return resp.json();
            }
        ).then(function () {
            location.reload();
        })
    }

    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = form.children[0].firstElementChild.value;
        const description = form.children[1].firstElementChild.value;
        apiCreateTask(title, description);
        form.children[0].firstElementChild.value = "Title";
        form.children[1].firstElementChild.value = "Description";
    });

    function apiDeleteTask(taskId) {
        return fetch(apihost + '/api/tasks/' + taskId, {
            headers: {
                Authorization: apikey
            },
            method: 'DELETE'
        }).then(function (resp) {
            if (!resp.ok) {
                alert("cos poszlo nie tak");
            }
            return resp;
        });
    }

    function apiCreateOperationForTask(taskId, description) {
        return fetch(apihost + '/api/tasks/' + taskId + '/operations', {
            headers: {
                Authorization: apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({description: description, timeSpent: 0}),
            method: 'POST'
        }).then(function (resp) {
            if (!resp.ok) {
                alert('Cos nei tak z dodaniem operacji')
            }
            return resp.json();
        })
    }
});

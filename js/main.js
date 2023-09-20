"use script";
const resultsDataKey = "results";
class Checker {

    constructor() {
        this.coordinates = {
            x: document.getElementById("x-value"),
            y: document.getElementById("y-value"),
            r: document.getElementById("r-value"),
            submit: document.getElementById("submit-button")
        };



        this.xSelect = document.getElementById("x-value");
        this.radioButtons = document.getElementsByName("radio");
        this.setupEventListenersX();
        this.setupEventListenersR();
        this.sessionStorage = window.sessionStorage;
        this.resultsTable = document.getElementById("results-content");
        this.initTableResults();

        var form = document.getElementById("user-request");
        form.addEventListener("submit", this.formSubmitHandler.bind(this));
        this.animations = new AnimationProcessor();
        this.restoreFormValues();
        this.restoreDisableVideoState();

    }



    setupEventListenersX() {
        this.xSelect.addEventListener("change", this.handleXSelectChange.bind(this));
    }

    handleXSelectChange(event) {
        this.coordinates.x.value = event.target.value;

    }
    setupEventListenersR() {
        this.radioButtons.forEach(radioButton => {
            radioButton.addEventListener("change", this.handleRadioChange.bind(this));
        });
    }

    handleRadioChange(event) {
        this.coordinates.r.value = event.target.value;
    }

    showToast(message) {
        const toast = document.getElementById("custom-toast");
        const toastContent = toast.querySelector(".toast-content");

        toastContent.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000); // Скрывать уведомление через 3 секунды (по желанию)
    }


    validateAndParse(x, y, r) {
        const xValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3];
        const yMin = -5, yMax = 5;
        const rValues = [1, 1.5, 2, 2.5, 3];
        let parsedX, parsedY, parsedR;

        parsedX = parseInt(x);
        if (isNaN(x.trim()) || isNaN(parsedX) || !xValues.includes(parsedX)) {
            this.showToast("Please choose correct button" + x);
            return [null, null, null];
        }

        parsedY = parseFloat(y);
        if (isNaN(y.trim()) || isNaN(parsedY) || yMin > parsedY || parsedY > yMax) {
            this.showToast("Please input correct Y value: [-5; 5]");
            return [null, null, null];
        }

        parsedR = parseFloat(r);
        if (isNaN(r.trim()) || isNaN(parsedR) || !rValues.includes(parsedR)) {
            this.showToast("Choose only one checkbox" + parsedR);
            return [null, null, null];
        }


        return [parsedX, parsedY, parsedR];
    }
    async formSubmitHandler(e) {
        e.preventDefault();
        this.coordinates.submit.textContent = "Checking...";
        this.coordinates.submit.disabled = true

        const [x, y, r] = this.validateAndParse(this.coordinates.x.value, this.coordinates.y.value, this.coordinates.r.value);
        if (x !== null && y !== null && r !== null) {
            try {
                const response = await fetch("src/process.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ x, y, r })
                });
                const json = await response.json();
                if (response.status === 200) {
                    if (!document.getElementById("disable-video").checked) {
                        let isKill = false;
                        if (json.result === "kill") {
                            isKill = true;
                        }
                        await this.animations.shoot(x, y, r, isKill);
                    }


                    var data = [x, y, r, json.now, json.script_time, json.result];
                    this.addTableResults(data);
                } else {
                    this.showToast("Server error: " + json.message);
                }
            } catch (error) {
                console.log(ErrorEvent);
                this.showToast("Server unreachable :(\nTry again later ");
            }
        }
        this.coordinates.submit.disabled = false;
        this.coordinates.submit.textContent = "Check";
        localStorage.setItem("x-value", this.coordinates.x.value);
        localStorage.setItem("y-value", this.coordinates.y.value);
        localStorage.setItem("r-value", this.coordinates.r.value);
        const disableVideoCheckbox = document.getElementById("disable-video");
        localStorage.setItem("disable-video-state", disableVideoCheckbox.checked);
    }
    initTableResults() {
        var data = this.sessionStorage.getItem(resultsDataKey);

        if (data === null) return;

        data.split(";").forEach(rowData => {
            var row = this.resultsTable.insertRow();

            rowData.split(",").forEach(cellData =>
                row.insertCell().innerHTML = cellData
            )
        })
    }

    addTableResults(rowData) {
        var row = this.resultsTable.insertRow(0);

        document.querySelectorAll('td[style="color: blue;"]').forEach(cell => cell.removeAttribute("style"));
        document.querySelectorAll('td[style="color: red;"]').forEach(cell => cell.removeAttribute("style"));

        rowData.forEach(cellData => {
            var cell = row.insertCell();
            cell.innerHTML = cellData;

            if (cellData === "kill") {
                cell.style = "color: blue;";
            } else if (cellData === "miss") {
                cell.style = "color: red;";
            }
        });

        var lastData = this.sessionStorage.getItem(resultsDataKey);
        this.sessionStorage.setItem(resultsDataKey, rowData.toString() + (lastData ? ";" + lastData : ""));
    }

    restoreFormValues() {
        // Восстановление значений полей из localStorage
        const xValue = localStorage.getItem("x-value");
        if (xValue) {
            this.coordinates.x.value = xValue;
        }

        const yValue = localStorage.getItem("y-value");
        if (yValue) {
            this.coordinates.y.value = yValue;
        }

        const rValue = localStorage.getItem("r-value");
        if (rValue) {
            this.coordinates.r.value = rValue;
        }
    }
    restoreDisableVideoState() {
        // Восстановление состояния кнопки "disable-video" из localStorage
        const disableVideoCheckbox = document.getElementById("disable-video");
        const disableVideoState = localStorage.getItem("disable-video-state");
        if (disableVideoState !== null) {
          disableVideoCheckbox.checked = (disableVideoState === "true");
        }
      }
}

const check = new Checker();
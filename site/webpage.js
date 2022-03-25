var alarmtime = "";
var alarmactive = false;
var playsound = null;
var button = null;

function Time() {
    // Creating object of the Date class
    var date = new Date();
    document.getElementById("ClockMain").innerText = gettruetime(date.getHours()) + " : " + gettruetime(date.getMinutes()) + " : " + gettruetime(date.getSeconds());
    if (alarmactive) {
        if(gettruetime(date.getHours()).toString() == alarmtime.substring(0,2).toString()) {
            if(gettruetime(date.getMinutes()).toString() === alarmtime.substring(3,5).toString()) {
                if (playsound == null) {
                    try {
                        var alarmpopup = document.getElementById("alarmpopup")
                        alarmpopup.style.visibility = 'visible'
                        playsound = new Audio("./alarm.mp3");
                        playsound.play()
                    } catch (error) {
                        console.log(error)
                    }
                }   
            }
        }
    }
    // Set Timer to 1 sec (1000 ms)
    setTimeout(Time, 1000);
}

function Init() {
    var alarmpopup = document.getElementById("alarmpopup")
    alarmpopup.style.visibility = 'hidden'

    var subclocktext = document.getElementById("ClockSub").innerText;
    if (subclocktext.endsWith(".")) {
        alarmtime = subclocktext.substring(subclocktext.length-6, subclocktext.length-1)
        if (subclocktext.charAt(subclocktext.length-2) !== "w") {
            alarmactive = true;
        }
    }

    button = document.getElementById("alarmdonebutton");
    button.addEventListener("click", event => {
        var alarmpopup = document.getElementById("alarmpopup");
        alarmpopup.style.visibility = 'hidden';
        alarmactive = false;
        playsound.pause();
        playsound = ""
    })
}

function gettruetime(input) {
    if (input < 10) {
        return "0" + input;
    }
    return input;
}

function Reload() {
    window.location.reload(true)
}

window.addEventListener("load", () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker");
    }
  });

setTimeout(Init, 100);
setTimeout(Time, 500);
setTimeout(Reload, 1800000);

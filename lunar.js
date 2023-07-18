
https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

// Initial values; state of the iterator
var time = 0; // Time (seconds)
var altitude = 120; // Altitude (miles)
var velocity = -1; // Velocity (miles/second)
var mass = 32500; // Total weight (LBS)
var MILES_SEC_TO_MILES_HOUR = 3600;
var FT_TO_MILES = 5280.00;

// constants
var dryMass = 16500; // Capsule weight (LBS)
var gravity = 0.001; // Gravity (miles/second**2)
var exhaustVelocity = 1.8; // Fuel exhaust velocity (miles/seconds)
var dt = 10;
var sub_steps = 1;
var dt_sim = dt/sub_steps;
var prev_fuelRate = 0;
var gameOver = false;
var vLanding;
var tLanding;
var massLanding;
var timeLanding;

document.getElementById("time").textContent = time;
document.getElementById("altitude").textContent = altitude;
document.getElementById("altitudeF").textContent = 0;
document.getElementById("velocity").textContent = - velocity * MILES_SEC_TO_MILES_HOUR;
document.getElementById("fuel").textContent = mass - dryMass;
var table = document.getElementById("Descent table");
var lastRowIndex = table.rows.length-1;
var lastCellIndex = table.rows[lastRowIndex].cells.length-1;
table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].value = "";
table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].focus();

function acceptFuelRate(fuelRate){
    return !isNaN(fuelRate) && (fuelRate == 0 || ( fuelRate >=20 && fuelRate <= 200));    
}

function computeVelocity(g, ve, v_in, m, fuelrate, t){
    return v_in -g*t + ve * Math.log(m / (mass - fuelrate * t)); 
}

function computeAltitude(g, v_prev, ve, a_in, m, fuelrate, t){
        var alt = a_in + v_prev * t - 0.5* g *t *t 
        if (fuelrate > 0){ 
            alt += ve * ( (t - (m / fuelrate)) * Math.log(m / (m - fuelrate * t) ) + t );
        }
        return alt
}


function addNewRow() {
    var lastRowIndex = table.rows.length-1;
    var lastCellIndex = table.rows[lastRowIndex].cells.length-1;
    var fuelRate = parseFloat(table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].value);
    table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].readOnly = true;

    if (acceptFuelRate(fuelRate)) {
        

        final_mass = mass - fuelRate * dt;
        
        var vprev = velocity
        var altitudePrev = altitude;

        velocity = computeVelocity(gravity, exhaustVelocity, vprev, mass, fuelRate, dt);
        altitude = computeAltitude(gravity, vprev, exhaustVelocity, altitudePrev, mass, fuelRate, dt);

        if (altitude <= 0){
            var ta = 0;
            var tc = dt;
            var tb = 0.5 * (ta + tc);
            
            var ab = computeAltitude(gravity, vprev, exhaustVelocity, altitudePrev, mass, fuelRate, tb);
            while (Math.abs(ab) > 1e-4) {
                if (ab > 0) {
                    ta = tb;
                } else if (ab < 0) {
                    tc = tb;
                }
                tb = 0.5 * (ta + tc);
                ab = computeAltitude(gravity, vprev, exhaustVelocity, altitudePrev, mass, fuelRate, tb);
            }
            tLanding = time + tb;
            vLanding = computeVelocity(gravity, exhaustVelocity, vprev, mass, fuelRate, tb);
            if (mass > 0) {
                massLanding = mass - fuelRate * tb;
            } else {
                massLanding = 0;
            }
            gameOver = true;
        }
    mass = final_mass;
    time += dt;
    } else {
        table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].value += ": NOT POSSIBLE"
    }
    columnValues = [time,
                    Math.floor(altitude).toLocaleString(undefined, { minimumFractionDigits: 2 }), 
                    (Math.round((altitude - Math.floor(altitude)) * FT_TO_MILES) ).toLocaleString(undefined, { minimumFractionDigits: 0 }), 
                    (-velocity * MILES_SEC_TO_MILES_HOUR).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                    (mass - dryMass).toLocaleString(undefined, { minimumFractionDigits: 2 })];
    
    if (!gameOver){
    var newRow = table.insertRow(table.rows.length);
    for (var i = 0; i < 5; i++) {
        var cell = newRow.insertCell(i);
        cell.className = "non-editable";
        cell.textContent = columnValues[i];
    }   

    var lastCell = newRow.insertCell(5);
    lastCell.innerHTML = '<input type="text" onkeypress="handleKeyPress(event, this)">';   
    window.scrollTo(0, table.offsetHeight);
    lastCell.childNodes[0].focus()} else {
        var el = document.createElement("h2");
        el.innerHTML = "ON THE MOON AT: " + tLanding.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SECS <br>" + 
        "IMPACT VELOCITY OF: " + (-vLanding * MILES_SEC_TO_MILES_HOUR).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " M.P.H. <br>" + 
        "FUEL LEFT: " + (massLanding - dryMass).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " LBS <br>";
        insertAfter(table, el);
    }
}



function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addNewRow();
    }
}
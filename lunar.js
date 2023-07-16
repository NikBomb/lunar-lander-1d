
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

function addNewRow() {
    var lastRowIndex = table.rows.length-1;
    var lastCellIndex = table.rows[lastRowIndex].cells.length-1;
    var fuelRate = parseFloat(table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].value);
    table.rows[lastRowIndex].cells[lastCellIndex].childNodes[0].readOnly = true;

    if (acceptFuelRate(fuelRate)) {
        

        final_mass = mass - fuelRate * dt;
        
        var vprev = velocity

        velocity += -gravity*dt + exhaustVelocity * Math.log(mass / (mass - fuelRate * dt)); 
        altitude +=  vprev * dt - 0.5* gravity *dt *dt 
        if (fuelRate > 0){ 
            altitude += exhaustVelocity * ( (dt - (mass / fuelRate)) * Math.log(mass / (mass - fuelRate * dt) ) + dt );
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
    
    
    var newRow = table.insertRow(table.rows.length);
    for (var i = 0; i < 5; i++) {
        var cell = newRow.insertCell(i);
        cell.className = "non-editable";
        cell.textContent = columnValues[i];
    }   

    var lastCell = newRow.insertCell(5);
    lastCell.innerHTML = '<input type="text" onkeypress="handleKeyPress(event, this)">';   
    window.scrollTo(0, table.offsetHeight);
    lastCell.childNodes[0].focus()
}



function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addNewRow();
    }
}
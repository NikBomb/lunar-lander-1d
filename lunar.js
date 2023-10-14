
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
var fuelMass = mass - dryMass;
var gravity = 0.001; // Gravity (miles/second**2)
var exhaustVelocity = 1.8; // Fuel exhaust velocity (miles/seconds)
var dt = 10;
var minimumF = 8;
var maximumF = 200

var gameOver = false;
var freeFall = false;
var tFuelOut;
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
    return !isNaN(fuelRate) && (fuelRate == 0 || ( fuelRate >=minimumF && fuelRate <= maximumF));    
}

function computeVelocity(g, ve, v_in, m, fuelrate, t){
    return v_in -g*t + ve * Math.log(m / (m - fuelrate * t)); 
}

function computeAltitude(g, v_prev, ve, a_in, m, fuelrate, t){
        var alt = a_in + v_prev * t - 0.5* g *t *t 
        if (fuelrate > 0){ 
        // alt += ve * ( (m - fuelrate * t)/fuelrate * Math.log((m - fuelrate * t)/fuelrate) + t );
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
        var dt_step = dt;

        final_mass = mass - fuelRate * dt_step;
        if (final_mass <= dryMass){
            final_mass = dryMass;
            dt_step = (mass - dryMass) / fuelRate; 
            tFuelOut = time + dt_step;
            freeFall = true;
        }

        var vprev = velocity
        var altitudePrev = altitude;

        velocity = computeVelocity(gravity, exhaustVelocity, vprev, mass, fuelRate, dt_step);
        altitude = computeAltitude(gravity, vprev, exhaustVelocity, altitudePrev, mass, fuelRate, dt_step);
        if (altitude <= 0){
            var ta = 0;
            var tc = dt_step;
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
        if (freeFall && !gameOver){
            var t1 = (velocity - Math.sqrt(velocity * velocity + 2 * gravity *altitude))/gravity; 
            var t2 = (velocity + Math.sqrt(velocity * velocity + 2 * gravity *altitude))/gravity;
            var tfree;
            if (Math.sign(t1) == 1){
                tfree = t1;
            } else {
                tfree = t2;
            }
            tLanding = tFuelOut + tfree;
            vLanding =  velocity - gravity * tfree;
            massLanding = dryMass;
            gameOver = true;
        }

    mass = final_mass;
    time += dt_step;
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
        var stringFuelOut = "";
        if (freeFall){
            stringFuelOut = "FUEL OUT AT: " + tFuelOut.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SECS <br>" ;
        }

        victoryString = ""
        vLandingMH = -vLanding * MILES_SEC_TO_MILES_HOUR;
        vDeep = vLandingMH * 0.27777;
        if (vLandingMH < 1){
            victoryString = "PERFECT LANDING !-(LUCKY)"
        } else if (vLandingMH < 10){
            victoryString = "GOOD LANDING-(COULD BE BETTER)";
        } else if (vLandingMH < 22){
            victoryString = "CONGRATULATIONS ON A POOR LANDING";
        } else if (vLandingMH < 40){
            victoryString = "CRAFT DAMAGE. GOOD LUCK";
        } else if (vLandingMH < 60){
            victoryString = "CRASH LANDING-YOU'VE 5 HRS OXYGEN";
        } else {
            victoryString = "SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT! <br>" +
            "IN FACT YOU BLASTED A NEW LUNAR CRATER " + vDeep.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " FT. DEEP"
        }
        el.innerHTML = stringFuelOut + "ON THE MOON AT: " + tLanding.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SECS <br>" + 
        "IMPACT VELOCITY OF: " + (vLandingMH).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " M.P.H. <br>" + 
        "FUEL LEFT: " + (massLanding - dryMass).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " LBS <br>" + 
        victoryString + "<br>";
        insertAfter(table, el);
    }
}



function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addNewRow();
    }
}

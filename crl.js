let timeOffset = 1 * 60; // offset is -x * 60 for GMT+x.

var crawledDat;
var isTimeReady = false;

async function getTimes(localTime, alt) {
    let regionalTime = localTimeToRegionalTime(localTime, timeOffset); 

    var httpReq = new XMLHttpRequest();
    httpReq.open("GET", (regionalTime.getMonth() + 1).toString() + ".html", false);
    httpReq.setRequestHeader("Access-Control-Allow-Origin","*");
    httpReq.send(null);

    if(httpReq.readyState == 4 && httpReq.status == 200) {
        //console.log('request OK!')

        var res = httpReq.responseText;

        if(alt == true) {
            return extractFromHTML(res, regionalTime);
        } else {
            function getTimesPromise(localTime) {
                return new Promise(resolve =>
                    {
                        resolve(getTimes(localTime, true));
                    }
                );
            }

            return [
                flattenAndSortTwilights(await getTimesPromise(new Date(localTime.getTime() - (1000 * 60 * 60 * 24)))),
                flattenAndSortTwilights(extractFromHTML(res, regionalTime)),
                flattenAndSortTwilights(await getTimesPromise(new Date(localTime.getTime() + (1000 * 60 * 60 * 24))))
            ];
        }
    } else {
        console.log("unable to access timeanddate.com.")
        return;
    }
}

function extractFromHTML(res, localTime) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(res, "text/html");
    var dataTable = doc.getElementById("as-monthsun");

    //console.log(dataTable);

    var date = localTime.getDate();
    /*var rowForToday = dataTable.children[1].children[date - 1];*/

    var rowForToday;
    var rows = dataTable.children[1].children;

    for(var i = 0; i < rows.length; i++) {
        if(rows[i].getAttribute("data-day") == date.toString()){
            rowForToday = rows[i];
            break;
        }
    }

    //console.log(rowForToday);

    var sunrise = rowForToday.children[1].innerHTML.split(' ')[0];
    var sunset = rowForToday.children[2].innerHTML.split(' ')[0];

    var day = [ stringToDate(sunrise, localTime), stringToDate(sunset, localTime) ];

    var dusk;
    
    //console.log(sunset);

    var twilights = [ [day] ];
    var twilightNum = rowForToday.children.length - 3;

    for(var i = 0; i < 3; i++) {

        var end = rowForToday.children[twilightNum].innerHTML.replace("<br>","");
        var begin;

        twilightNum--;

        if(end != "-" && end != "Rest of night") {
            begin = rowForToday.children[twilightNum].innerHTML.replace("<br>","");
            twilightNum--;
        }

        var twilight;

        if(end == "-") {
            twilight = [];
        } else if(end == "Rest of night") {
            /*var last = twilights[twilights.length - 1];

            if(last.length == 1) {
                twilight = [["00:00", last[0][0]], [last[0][1], "24:00"]];
            } else {
                twilight = [[last[0][1], last[1][0]]];
            }*/

            twilight = [[stringToDate("00:00", localTime), stringToDate("24:00", localTime)]];
        } else {
            begin = begin.split('-');
            end = end.split('-');

            if(begin.length == 2 || end.length == 2) { // there is only two cases, either both of them are length 2, or they are both length 1.
                twilight = [
                    [
                        begin[0] == "" ? stringToDate("00:00", localTime) : stringToDate(begin[0], localTime),
                        end[0] == "" ? stringToDate("24:00", localTime) : stringToDate(end[0], localTime)
                    ],
                    [
                        begin[1] == "" ? stringToDate("00:00", localTime) : stringToDate(begin[1], localTime),
                        end[1] == "" ? stringToDate("24:00", localTime) : stringToDate(end[1], localTime)
                    ]
                ];
            } else {
                twilight = [[ stringToDate(begin[0], localTime), stringToDate(end[0], localTime) ]];
            }
        }

        twilights.push(twilight);
    }

    var result = [[ day ]];

    for(var i = 1; i < 4; i++) {
        result.push(subtractDateRange(twilights[i], twilights[i-1]));
    }

    return result;
}

function localTimeToRegionalTime(localTime, offset) {
    let localOffset = localTime.getTimezoneOffset(); // If the client's timezone is GMT+4, then localOffset is -4 * 60 = -240.
    //let tampereOffset = -3 * 60; // Tampere, Finland's timezone is GMT+3.

    var diff = localOffset - offset;
    var regionalTime = new Date(localTime.getTime());
    regionalTime.setMinutes(regionalTime.getMinutes() + diff);
    
    return regionalTime;
}

function stringToDate(str, date) {
    var rtn = new Date(date.getTime());
    var hourNminute = str.split(':');
    rtn.setHours(parseInt(hourNminute[0]), parseInt(hourNminute[1]), 0);
    
    return rtn;
}

function getStateAndProg(time, twilightsList) {
    
    var twilights = twilightsList[1];

    for(var i = 0; i < twilights.length; i++) {

        if(isDateInRange(time, twilights[i].range, true)) {
            var currentState = twilights[i].state;
            var priorState;
            var afterState;

            // the below code assumes that there are no midnight suns or polar nights. i.e. twilights.length != 0

            var rangeBegin = twilights[i].range[0];
            var rangeEnd = twilights[i].range[1];

            if(i == 0) {
                afterState = twilights[i + 1].state;
                
                var yesterdayLast = twilightsList[0][twilightsList[0].length - 1];
                priorState = yesterdayLast.state == currentState ? twilightsList[0][twilightsList[0].length - 2].state : yesterdayLast.state;
                
                if(yesterdayLast.state == currentState) { // current state started yesterday
                    rangeBegin = yesterdayLast.range[0];
                }
            } else if(i == twilights.length - 1) {
                priorState = twilights[i - 1].state;

                var tomorrowFirst = twilightsList[2][0];
                afterState = tomorrowFirst.state == currentState ? twilightsList[2][1].state : tomorrowFirst.state;

                if(tomorrowFirst.state == currentState) { // current state continues tomorrow
                    rangeEnd = tomorrowFirst.range[1]
                }
            } else {
                priorState = twilights[i - 1].state;
                afterState = twilights[i + 1].state;
            }

            var increasing; // -1: getting darker, 1: getting brighter, 0: stays at a constant lightness

            if(priorState == afterState) {
                increasing = 0;
            } else if(afterState > currentState) {
                increasing = -1;
            } else {
                increasing = 1;
            }

            var diff = rangeEnd.getTime() - rangeBegin.getTime();
            var absProg = time.getTime() - rangeBegin.getTime();
            var prog = absProg / diff;

            return {
                state: currentState,
                progress: prog,
                increasing: increasing,
                range: [rangeBegin, rangeEnd]
            };
        }
    }

    return undefined;
}

function getColIndList(twilightsList) {

    /*
        following abbreviations are used for the names of variables.
        day: d,
        civil twilight: c,
        nautical twilight: n,
        astronomical twilight: a,
        night: ni,
        lightness: l
    */

    // set all the nessecary constants.

    Math.seedrandom(getDateString(twilightsList[1][0].range[0]));
    let hue = 360 * Math.random();
    let saturation = 100 * Math.random();

    Math.seedrandom(getDateString(twilightsList[2][0].range[0]));
    let aHue = 360 * Math.random();
    let aSaturation = 100 * Math.random();

    Math.seedrandom(getDateString(twilightsList[0][0].range[0]));
    let bHue = 360 * Math.random();
    let bSaturation = 100 * Math.random();

    let l = [
        85,
        64,
        43,
        22,
        1
    ];
    
    var twilights = twilightsList[1];

    var colList = [];
    var indList = [];

    for(var i = 0; i < twilights.length; i++) {

        var currentState = twilights[i].state;
        var prior;
        var after;

        // the below code assumes that there are no midnight suns or polar nights. i.e. twilights.length != 0

        var rangeBegin = twilights[i].range[0];
        var rangeEnd = twilights[i].range[1];

        var startHue = hue;
        var endHue = hue;

        var startSat = saturation;
        var endSat = saturation;

        if(i == 0) {
            after = twilights[i + 1];
            
            var yesterdayLast = twilightsList[0][twilightsList[0].length - 1];
            prior = yesterdayLast.state == currentState ? twilightsList[0][twilightsList[0].length - 2] : yesterdayLast;

            if(yesterdayLast.state == currentState) { // current state started yesterday
                rangeBegin = yesterdayLast.range[0];
            }

            startHue = bHue;
            startSat = bSaturation;
        } else if(i == twilights.length - 1) {
            prior = twilights[i - 1];

            var tomorrowFirst = twilightsList[2][0];
            after = tomorrowFirst.state == currentState ? twilightsList[2][1] : tomorrowFirst;

            if(tomorrowFirst.state == currentState) { // current state continues tomorrow
                rangeEnd = tomorrowFirst.range[1]
            }

            endHue = aHue;
            endSat = aSaturation;
        } else {
            prior = twilights[i - 1];
            after = twilights[i + 1];
        }

        var colours = [];
        var indeces = [];

        if(currentState == 0 || currentState == 4) {
            var startTemp = hsluv.hsluvToRgb([startHue, startSat, l[currentState]]);
            colours.push(new Colour(startTemp[0] * 255, startTemp[1] * 255, startTemp[2] * 255));
            indeces.push(rangeBegin.getTime() / 100000);

            var endTemp = hsluv.hsluvToRgb([endHue, endSat, l[currentState]]);
            colours.push(new Colour(endTemp[0] * 255, endTemp[1] * 255, endTemp[2] * 255));
            indeces.push(rangeEnd.getTime() / 100000);
        } else {
            var aTemp = hsluv.hsluvToRgb([startHue, startSat, l[currentState]]);
            var a = new Colour(aTemp[0] * 255, aTemp[1] * 255, aTemp[2] * 255);
            var bTemp = hsluv.hsluvToRgb([endHue, endSat, l[currentState]]);
            var b = new Colour(bTemp[0] * 255, bTemp[1] * 255, bTemp[2] * 255);
            var res = Colour.lerp(a, b, 0.5);

            if(i == 0) {
                var priorTemp = hsluv.hsluvToRgb([bHue, bSaturation, l[prior.state]]);
                var priorCol = new Colour(priorTemp[0] * 255, priorTemp[1] * 255, priorTemp[2] * 255);
                var priorTime;
                
                if(prior.state == 0 || prior.state == 4) {
                    priorTime = prior.range[0].getTime();
                } else {
                    priorTime = (prior.range[0].getTime() + prior.range[1].getTime()) / 2;
                }

                colours.push(priorCol);
                indeces.push(priorTime / 100000);
            }

            colours.push(res);
            indeces.push((rangeBegin.getTime() + rangeEnd.getTime()) / 2 / 100000);

            if(i == twilights.length - 1) {
                var afterTemp = hsluv.hsluvToRgb([aHue, aSaturation, l[after.state]]);
                var afterCol = new Colour(afterTemp[0] * 255, afterTemp[1] * 255, afterTemp[2] * 255);
                var afterTime;
                
                if(after.state == 0 || after.state == 4) {
                    afterTime = after.range[0].getTime();
                } else {
                    afterTime = (after.range[0].getTime() + after.range[1].getTime()) / 2;
                }

                colours.push(afterCol);
                indeces.push(afterTime / 100000);
            }
        }

        colList.push(...colours);
        indList.push(...indeces);
    }

    return {
        colours: colList,
        indeces: indList
    };
}

function getDateString(date) { // used to populate a seed for generating a random hue for each day.
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    return year.toString() + month.toString() + day.toString();
}

function isDateInRange(date, range, isInclusive) {
    if(isInclusive) {
        return (date.getTime() >= range[0].getTime() && date.getTime() <= range[1].getTime());
    } else {
        return (date.getTime() > range[0].getTime() && date.getTime() < range[1].getTime());
    }
}

function subtractDateRange(f, t) { // f/t
    var a = [...f];
    var b = [...t];

    for(var i = 0; i < a.length; i++) {
        for(var j = 0; j < b.length; j++) { // the loop is not optimised, and therefore should be adjusted to handle more complex sets.
            var aStart = a[i][0];
            var aEnd = a[i][1];
            var bStart = b[j][0];
            var bEnd = b[j][1];

            var isBStartInA = isDateInRange(bStart, a[i]);
            var isBEndInA = isDateInRange(bEnd, a[i]);
            var isBInA = isBStartInA && isBEndInA;

            var isOnlyBStartInA = isBStartInA && !isBEndInA;
            var isOnlyBEndInA = isBEndInA && !isBStartInA;

            var isBStartBeforeA = bStart.getTime() < aStart.getTime();
            var isBEndAfterA = bEnd.getTime() > aEnd.getTime();
            var isAInB = isBStartBeforeA && isBEndAfterA;

            var res = [];

            var replace = false;

            if(isBInA) {
                res = [
                    [ aStart, bStart ],
                    [ bEnd, aEnd ]
                ];
                replace = true;
            } else if(isOnlyBStartInA) {
                res = [
                    [ aStart, bStart ]
                ];
                replace = true;
            } else if(isOnlyBEndInA) {
                res = [
                    [ bEnd, aEnd ]
                ];
                replace = true;
            } else if(isAInB) {
                res = [];
                replace = true;
            }

            if(replace) {
                a.splice(i, 1, ...res);
                i += res.length - 1;
            }
        }
    }

    return a;
}

function flattenAndSortTwilights(twilights) {
    var list = [];

    for(var i = 0; i < twilights.length; i++) {
        for(var j = 0; j < twilights[i].length; j++) {
            var item = {
                state: i,
                range: twilights[i][j]
            };

            var inserted = false;

            for(var k = 0; k < list.length; k++) {
                if(list[k].range[0].getTime() > item.range[0].getTime()) {
                    list.splice(k, 0, item);
                    inserted = true;
                    break;
                }
            }

            if(!inserted) {
                list.push(item);
            }
        }
    }

    if(list[0].range[0].getTime() > stringToDate("00:00", list[0].range[0]).getTime()) {
        list.splice(0, 0, {
            state: 4,
            range: [
                stringToDate("00:00", list[0].range[0]),
                list[0].range[0]
            ]
        })
    }

    if(list[list.length - 1].range[1].getTime() < stringToDate("24:00", list[0].range[0]).getTime()) {
        list.push({
            state: 4,
            range: [
                list[list.length - 1].range[1],
                stringToDate("24:00", list[0].range[0])
            ]
        })
    }

    return list;
}
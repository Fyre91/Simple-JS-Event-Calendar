/* Calendar Renderer
* Author: Piyush Kumar Tiwari
* Start Date: 3 April 2015
* End Date: 4 April 2015
*/

var Calendar = Calendar || {};
(function () {

    'use strict';
    Calendar.months = {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December'
    };

    Calendar.days = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
    };

    Calendar.dates = {};

    //Number of days in month
    Calendar.daysInMonths = {
        0: 31,
        1: 28,
        2: 31,
        3: 30,
        4: 31,
        5: 30,
        6: 31,
        7: 31,
        8: 30,
        9: 31,
        10: 30,
        11: 31
    };

    //Initialize the calendar
    Calendar.init = function () {
        //Render the days as headers
        var compiled = _.template($("#day-temp").html());
        $("#dayNames").html(compiled(Calendar));

        //Render the month area
        var compiledMonths = _.template($("#month-temp").html());
        $("#months").html(compiledMonths(Calendar));
        
        //Render the year area
        var compiledYears = _.template($("#year-temp").html());
        $("#years").html(compiledYears);
        var currentDate = new Date();

        $("#years").val(currentDate.getFullYear());
        $("#months").val(currentDate.getMonth());

        this.convertJSON();
        this.renderCalendar(currentDate);
        
        //Get specific month & year calendar
        $("#months, #years").on("change", function (e) {
            Calendar.renderCalendar(new Date($("#years").val(), $("#months").val(), 1));
        });

        //Get the next month view
        $("body").on("click", "#nextMonth", function () {
            var currentMonth = parseInt($("#months").val(), 10),
                currentYear = parseInt($("#years").val(), 10);

            //Switch to next year if last month
            if(currentMonth >= 11) {
                $("#years").val(currentYear + 1);
                $("#months").val(0);

                Calendar.renderCalendar(new Date(currentYear + 1, 0, 1));
                return;
            }
            $("#months").val(currentMonth + 1);

            Calendar.renderCalendar(new Date(currentYear, currentMonth + 1, 1));
        });

        //Get the Previous month view
        $("body").on("click", "#prevMonth", function () {
            var currentMonth = parseInt($("#months").val(), 10),
                currentYear = parseInt($("#years").val(), 10);

            //Switch to next year if prev month
            if(currentMonth === 0) {
                $("#years").val(currentYear - 1);
                $("#months").val(11);

                Calendar.renderCalendar(new Date(currentYear - 1, 11, 1));
                return;
            }
            $("#months").val(currentMonth - 1);

            Calendar.renderCalendar(new Date(currentYear, currentMonth - 1, 1));
        });
        
        //Get the day view
        $("body").on("click", "#calendar-grid tbody td", function (e) {
            $(".calendar-header, .calendar-days").hide();
            $("#calendar-header-dayView").show();

            var currentMonth = $("#months").val(),
                currentYear = $("#years").val();
            //Get the date clicked
            var clickedDate = parseInt($(this).closest("table").find("thead td:eq(" + this.cellIndex +")").html(), 10);
            
            //var event = $(this).text().replace(/\n/g, "").replace(/ /g, "");
            Calendar.renderDayPlan(currentYear, currentMonth, clickedDate);
        });

        //Get the month view
        $("body").on("click", "#monthView", function () {
            $(".calendar-header, .calendar-days").show();
            $("#calendar-header-dayView").hide();
            Calendar.renderCalendar(new Date($("#years").val(), $("#months").val(), 1)); 
        });

        //Get the next day view
        $("body").on("click", "#nextDay", function () {
            var currentMonth = parseInt($("#months").val(), 10),
                currentYear = parseInt($("#years").val(), 10),
                currentDate = parseInt($("#days").val(), 10);

            //Switch to next month if last day
            if(currentMonth === 1 && currentDate === 28) {
                Calendar.renderDayPlan(currentYear, currentMonth + 1, 1);
                return;
            } else if ([0, 2, 4, 6, 7, 9, 11].indexOf(currentMonth) === 0 && currentDate === 31) {
                Calendar.renderDayPlan(currentYear, currentMonth + 1, 1);
                return;
            } else if( [3,5,8,10].indexOf(currentMonth) === 0 && currentDate === 30) {
                Calendar.renderDayPlan(currentYear, currentMonth + 1, 1);
                return;
            }

            Calendar.renderDayPlan(currentYear, currentMonth, currentDate + 1);
            $("#days").val(currentDate + 1);

        });

        //Get the prev day view
        $("body").on("click", "#prevDay", function () {
            var currentMonth = parseInt($("#months").val(), 10),
                currentYear = parseInt($("#years").val(), 10),
                currentDate = parseInt($("#days").val(), 10);

            //Switch to prev month if first day
            if(currentMonth === 2 && currentDate === 1) {
                Calendar.renderDayPlan(currentYear, currentMonth - 1, 28);
                return;
            } else if ([0, 1, 4, 6, 7, 9, 11].indexOf(currentMonth) === 0 && currentDate === 1) {
                Calendar.renderDayPlan(currentYear, currentMonth - 1, 30);
                return;
            } else if( currentDate === 1) {
                Calendar.renderDayPlan(currentYear, currentMonth - 1, 31);
                return;
            }

            Calendar.renderDayPlan(currentYear, currentMonth, currentDate - 1);
            $("#days").val(currentDate - 1);

        });

        $("body").on("change", "#days", function () {
            Calendar.renderDayPlan(parseInt($("#years").val(), 10), parseInt($("#months").val(), 10), parseInt($("#days").val(), 10));
        });

    };

    //Convert JSON to year-month-date object to render calendar in month view
    Calendar.convertJSON = function () {
        var events = Calendar.events,
            tmpObj = tmpObj || {};
         _.each(events, function (event) {
           
            var start = event.start,
                startDay = start.split("+")[0],
                startTime = start.split("+")[1],
                end = event.end,
                endDay = end.split("+")[0],
                endTime = end.split("+")[1];
            
            event.start = startDay;
            event.startTime = startTime;

            event.end = endDay;
            event.endTime = endTime;

            var arr = startDay.split("-");
            var arrEnd = endDay.split("-");

            arr = _.map(arr, function(item) {
                return parseInt(item, 10);
            });
            arrEnd = _.map(arrEnd, function(item) {
                return parseInt(item, 10);
            });


            tmpObj = tmpObj || {};
            tmpObj[arr[0]] = tmpObj[arr[0]] || {};
            tmpObj[arr[0]][arr[1]] = tmpObj[arr[0]][arr[1]] || {};
            tmpObj[arr[0]][arr[1]][arr[2]] = tmpObj[arr[0]][arr[1]][arr[2]] || [];
            tmpObj[arr[0]][arr[1]][arr[2]].push(event);

            for(var i = arr[2]+1; i <= arrEnd[2]; i += 1) {
                tmpObj[arr[0]][arr[1]][i] = tmpObj[arr[0]][arr[1]][i] || [];
                tmpObj[arr[0]][arr[1]][i].push(event);
            }           

            // for(var k = arr[1]; k <= arrEnd[1]; k += 1) {
            //     tmpObj[arr[0]][k] = tmpObj[arr[0]][k] || {};
                
            // } 
        });
        Calendar.events = tmpObj;
    };

    //Display the grid wise dates in month view
    Calendar.renderCalendar = function (currentDate) {
        var currentYear = currentDate.getFullYear(),
            currentMonth = currentDate.getMonth();

        var firstDate = new Date(currentYear, currentMonth, 1),
            lastDate = new Date(currentYear, currentMonth + 1, 0);

        var eventObj = Calendar.events[currentYear] || {};

        this.initDates(firstDate.getDay(), lastDate.getDate(), eventObj[currentMonth] );

        var compiledDates = _.template($("#date-temp").html());

        $("#calendar-grid").html(compiledDates(Calendar));
    };

    //Initialize all the dates to display in month view
    Calendar.initDates = function (start, end, events) {
        var counter = 1;
        end = parseInt(end, 10) + parseInt(start, 10);
        Calendar.dates = {};
        for(var i = 0; i < 35; i += 1) {

            Calendar.dates[i] = Calendar.dates[i] || {};
            Calendar.dates[i]["events"] = Calendar.dates[i]["events"] || [];
            if(i >= start && i < end) {
                if(typeof events !== 'undefined' && typeof events[counter] !== 'undefined' ) {
                    Calendar.dates[i]["events"] = events[counter];
                }
                Calendar.dates[i]["digit"] = counter++;
            } else {
                Calendar.dates[i]["digit"] = '';
            }
        }
    };

    //Convert JSON to event-time format to display in day view
    Calendar.getJSONTime = function (year, month, date) {
        var eventYear = Calendar.events[year] || {},
            eventMonth = eventYear[month] || {},
            eventArr = eventMonth[date] || [],
            tmpObj = {},
            startTime,
            endTime;

        
        for(var i = 0; i <= 23; i += 1) {
            tmpObj[i] = tmpObj[i] || [];
        }
    
        _.each(eventArr, function (event) {
            startTime = parseInt(event["startTime"].split(":")[0], 10);
            endTime = parseInt(event["endTime"].split(":")[0], 10) + 1;

            for(var i = startTime; i < endTime; i += 1) {
                tmpObj[i].push(event.name);
            }
        });
        return tmpObj;
    };

    //Render day plan along with events
    Calendar.renderDayPlan = function (currentYear, currentMonth, clickedDate) {
        //Set the exact month and year
        $("#years").val(currentYear);
        $("#months").val(currentMonth);
        
        Calendar.eventTime = Calendar.getJSONTime(currentYear, currentMonth, clickedDate);

        var dayCompiled = _.template($("#daysInMonth").html());
        $("#days").html(dayCompiled({numDays: Calendar.daysInMonths[currentMonth]}));
        $("#days").val(clickedDate);


        var compiled = _.template($("#dayView-temp").html());
        $("#calendar-grid").html(compiled(Calendar));
    };
})();

$(function () {

    $.ajax({
        url: 'json/events.json',
        type: 'GET',
        dataType: 'JSON',
        success: function (data) {
            Calendar.events = data;
            Calendar.init();
        }
    });
    
});
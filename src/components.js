import {
  calendarRef
} from './consts';

export default function (editor, opt = {}) {
  const c = opt;
  const domc = editor.DomComponents;
  const defaultType = domc.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const pfx = c.calendarClsPfx;
  const CALENDAR_TYPE = calendarRef;

  domc.addType(CALENDAR_TYPE, {

    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        startfrom: c.startTime,
        endTime: c.endTime,
        allDay: c.allDay,
        droppable: false,
        traits: [{
          label: 'Start',
          name: 'startfrom',
          changeProp: 1,
          type: c.dateInputType,
        },
        {
          label: 'End',
          name: 'endTime',
          changeProp: 1,
          type: c.dateInputType,
        },
        {
          label: 'All Day',
          name: 'allDay',
          type: 'checkbox',
          changeProp: 1,
          valueTrue: 'YES', // Value to assign when is checked, default: `true`
          valueFalse: 'NO', // Value to assign when is unchecked, default: `false`
        },
       {
          label: 'Title',
          name: 'title',
          changeProp: 1,
        },
        {
          label: 'Description',
          name: 'description',
          changeProp: 1,
        },
        {
          label: 'Address',
          name: 'address',
          changeProp: 1,
          placeholder: 'eg. London, UK'
        }
        ],
        script: function () {
          var MS_IN_MINUTES = 60 * 1000;

          var dropbtn = this.querySelector('[data-js=dropbtn]');
          var calendarDropdown = this.querySelector('[data-js=calendarDropdown]');
          var googlehref = this.querySelector('[data-js=google]');
          var yahoohref = this.querySelector('[data-js=yahoo]');
          var off365href = this.querySelector('[data-js=off365]');
          var icalhref = this.querySelector('[data-js=ical]');
          var outlookhref = this.querySelector('[data-js=outlook]');

          var startTime = new Date('{[ startfrom ]}');
          var endTime = new Date('{[ endTime ]}');
          var title = '{[ title ]}';
          var description = '{[ description ]}';
          var address = '{[ address ]}';
          var allDay = '{[ allDay ]}';
          var timezone = '{[ timezone ]}';
          var tzstart = new Date(startTime);
          var tzend = new Date(endTime);
          var duration = tzend - tzstart;

          var google = function() {
            var startTimeG, endTimeG;
            
            if (allDay.indexOf('YES') != -1) {
              // google wants 2 consecutive days at 00:00
              startTimeG = formatTime(startTime);
              endTimeG = formatTime(getEndDate(endTime, 60 * 24));
              startTimeG = stripISOTime(startTimeG);
              endTimeG = stripISOTime(endTimeG);
            } else {
              if (timezone && timezone !== ' ') {
                // google is somehow weird with timezones. 
                // it works better when giving the local
                // time in the given timezone without the zulu, 
                // and pass timezone as argument.
                // but then the dates we have loaded 
                // need to shift inverse with tzoffset the 
                // browser gave us. 
                // so
                var shiftstart, shiftend;
                shiftstart = new Date(startTime.getTime() - startTime.getTimezoneOffset() * MS_IN_MINUTES);
                if (endTime && endTime !== ' ') {
                  shiftend = new Date(endTime.getTime() - endTime.getTimezoneOffset() * MS_IN_MINUTES);
                }
                startTimeG = formatTime(shiftstart);
                endTimeG = formatTime(shiftend);
                // strip the zulu and pass the tz as argument later
                startTimeG = startTimeG.substring(0, startTimeG.length - 1);
                endTimeG = endTimeG.substring(0, endTimeG.length - 1);
              } else {
                // use regular times
                startTimeG = formatTime(startTime);
                endTimeG = formatTime(endTime);
              }
            }

            return encodeURI([
              'https://www.google.com/calendar/render',
              '?action=TEMPLATE',
              '&text=' + (title || ''),
              '&dates=' + (startTimeG || ''),
              '/' + (endTimeG || ''),
              (timezone) ? '&ctz=' + timezone : '',
              '&details=' + (description || ''),
              '&location=' + (address || ''),
              '&sprop=&sprop=name:'
            ].join(''));
          };

          var yahoo = function() {
            if (allDay === 'YES') {
              var yahooEventDuration = 'allday';
            } else {

              var eventDuration = tzend ?
                ((tzend.getTime() - tzstart.getTime()) / MS_IN_MINUTES) :
                duration;

              // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm


              var yahooHourDuration = eventDuration < 600 ?
                '0' + Math.floor((eventDuration / 60)) :
                Math.floor((eventDuration / 60)) + '';

              var yahooMinuteDuration = eventDuration % 60 < 10 ?
                '0' + eventDuration % 60 :
                eventDuration % 60 + '';

              var yahooEventDuration = yahooHourDuration + yahooMinuteDuration;
            }

            // Remove timezone from event time
            // var st = formatTime(new Date(event.start - (event.start.getTimezoneOffset() * MS_IN_MINUTES))) || '';

            var st = formatTime(tzstart) || '';

            return encodeURI([
              'http://calendar.yahoo.com/?v=60&view=d&type=20',
              '&title=' + (title || ''),
              '&st=' + st,
              '&dur=' + (yahooEventDuration || ''),
              '&desc=' + (description || ''),
              '&in_loc=' + (address || '')
            ].join(''));
          };

          var off365 = function() {
            var startTimeTmp = formatTime(tzstart);
            var endTimeTmp = formatTime(tzend);

            return encodeURI([
              'https://outlook.office365.com/owa/',
              '?path=/calendar/action/compose',
              '&rru=addevent',
              '&subject=' + (title || ''),
              '&startdt=' + (startTimeTmp || ''),
              '&enddt=' + (endTimeTmp || ''),
              '&body=' + (description || ''),
              '&location=' + (address || ''),
              '&allday=' + (allDay === 'YES') ? 'true' : 'false'
            ].join(''));
          };

          var ics = function() {
            var startTimeTmp, endTimeTmp;

            if (allDay === 'YES') {
              // DTSTART and DTEND need to be equal and 0
              startTimeTmp = formatTime(tzstart);
              endTimeTmp = startTime = stripISOTime(startTime) + 'T000000';
            } else {
              startTimeTmp = formatTime(tzstart);
              endTimeTmp = formatTime(tzend);
            }

            return encodeURI(
              'data:text/calendar;charset=utf8,' + [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                'URL:' + document.URL,
                'DTSTART:' + (startTimeTmp || ''),
                'DTEND:' + (endTimeTmp || ''),
                'SUMMARY:' + (title || ''),
                'DESCRIPTION:' + (description || ''),
                'LOCATION:' + (address || ''),
                'UID:' + document.URL,
                'END:VEVENT',
                'END:VCALENDAR'].join('\n'));
          };

          var formatTime = function(date) {
            return date ? new Date(date).toISOString().replace(/-|:|\.\d+/g, '') : '';
          };
          var getEndDate = function(start, duration) {
            return new Date(new Date(start).getTime() + duration * MS_IN_MINUTES);
          };
          var stripISOTime = function(isodatestr) {
            return isodatestr.substr(0, isodatestr.indexOf('T'));
          };

          var changeTimezone = function(date, timezone) {
            if (date) {
              if (timezone) {
                var invdate = new Date(date.toLocaleString('en-US', { 
                  timeZone: timezone 
                }));
                var diff = date.getTime()-invdate.getTime();
                return new Date(date.getTime()+diff);
              } 
              return date;
            }
            return;
          };

          if (timezone && timezone !== ' ') {
            tzstart = changeTimezone(startTime, timezone);
            tzend = changeTimezone(endTime, timezone);
          }

          googlehref.href = google();
          yahoohref.href = yahoo();
          off365href.href = off365();
          icalhref.href = ics();
          outlookhref.href = ics();

          dropbtn.onclick = function() {
            calendarDropdown.classList.toggle("show");
          }

          // Close the dropdown menu if the user clicks outside of it
          window.onclick = function (event) {
            if (!event.target.matches('.dropbtn')) {
                if (calendarDropdown.classList.contains('show')) {
                calendarDropdown.classList.remove('show');
              }
            }
          }
        }
      },
    }, {
      isComponent(el) {
        if (el.getAttribute &&
          el.getAttribute('data-gjs-type') == CALENDAR_TYPE) {
          return {
            type: CALENDAR_TYPE
          };
        }
      },
    }),


    view: defaultView.extend({
      init() {
        const props = [
          'title',
          'description',
          'address',
          'allDay',
          'startTime',
          'endTime',
        ];
        const reactTo = props.map(prop => `change:${prop}`).join(' ');
        this.listenTo(this.model, reactTo, this.updateScript);
        const comps = this.model.get('components');

        // Add a basic calendar template if it's not yet initialized
        if (!comps.length) {
          comps.reset();
          comps.add(`
          <div class="dropdown">
            <div data-js="dropbtn" class="dropbtn">${c.labelCalendarButton}</div>
              <div data-js="calendarDropdown" class="${pfx}-dropdown dropdown-content">
                <a data-js="google" href="" target="_balnk">${c.google}</a>
                <a data-js="yahoo" href="" target="_balnk">${c.yahoo}</a>
                <a data-js="off365" href="" target="_balnk">${c.off365}</a>
                <a data-js="ical" href="" target="_balnk">${c.ical}</a>
                <a data-js="outlook" href="" target="_balnk">${c.outlook}</a>
              </div>
            </div>
          `);
        }
      }
    }),
  });
}

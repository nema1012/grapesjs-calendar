import loadComponents from './components';
import loadBlocks from './blocks';
import en from './locale/en';
import {
  calendarRef
} from './consts';

export default (editor, opts = {}) => {
  const options = { ...{
    i18n: {},
    // default options
    blocks: [calendarRef],

    // Default style
    title: '',
    description: '',
    address: '',
    download: 'Calendar-event.ics',
    google: '<i class="fab fa-google"></i> Google Calendar',
    yahoo: '<i class="fab fa-yahoo"></i> Yahoo! Calendar',
    off365: '<i class="fab fa-windows"></i> Office 365',
    ical: '<i class="fab fa-apple"></i> iCalendar',
    outlook: '<i class="fab fa-windows"></i> Download Outlook',
    allDay: 'NO',

    // Default style
    defaultStyle: true,
    // Default start time, eg. '2018-01-25 00:00'
    startTime: '',
    endTime: '',
    timezone: '',
    // Date input type, eg, 'date', 'datetime-local'
    dateInputType: 'datetime-local',
    // calendar class prefix
    calendarClsPfx: 'calendar',
    // Add to Calendar label
    labelCalendarButton: '<i class="far fa-calendar-plus"></i> Event zum Kalender hinzufügen',
    // calendar label
    labelCalendar: 'Kalendar',
    // Countdown category label
    labeCalendarCategory: 'Extra',
  },  ...opts };

  // Add components
  loadComponents(editor, options);
  // Add blocks
  loadBlocks(editor, options);
  // Load i18n files
  editor.I18n && editor.I18n.addMessages({
      en,
      ...options.i18n,
  });
};
import {
  calendarRef
} from './consts';


export default (editor, opts = {}) => {
  const c = opts;
  const bm = editor.BlockManager;
  const pfx = c.calendarClsPfx;
  const style = c.defaultStyle ? `<style>
  .dropbtn {
    padding: 16px;
    font-size: 16px;
    border: none;
    cursor: pointer;
  }
  
  /* Dropdown button on hover & focus */
  .dropbtn:hover, .dropbtn:focus {
    background-color: #ddd;
  }
  
  /* The container <div> - needed to position the dropdown content */
  .dropdown {
    position: relative;
    display: inline-block;
  }
  
  /* Dropdown Content (Hidden by Default) */
  .dropdown-content {
    display: none;
    min-width: 160px;
    z-index: 1;
    position: absolute;
    opacity: initial
    background-color: white
  }
  
  /* Links inside the dropdown */
  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }
  
  /* Change color of dropdown links on hover */
  .dropdown-content a:hover {background-color: #ddd}
  
  /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
  .dropdown-content.show {
    display: block;
  }
  </style>` : '';

  bm.add(calendarRef, {
    label: c.labelCalendar,
    category: c.labeCalendarCategory,
    attributes: {class:'fa fa-calendar'},
    content: `
      <div class="${pfx}" data-gjs-type="calendar">
      ${style}
      </div>`
    // media: '<svg>...</svg>',
  });
}

function depends_fullcalview (){
	if (!$.fn.fullCalendar){
		$('head').append('<link rel="stylesheet" href="fullcalendar/fullcalendar.css" type="text/css" />');
		return ['fullcalendar/lib/moment.min.js', 
		'fullcalendar/fullcalendar.js', 
		'fullcalendar/lang/de.js', 
		'ical/ical.js', 
		'ical/ical_events.js', 
		'ical/ical_fullcalendar.js'];
	};
};

var Modul_fullcalview = function () {
	var eventsources;
	var eventcolors;
	var eventtextcolors;
	var firstRun = [];
	
	function data_req (url, callback) {
		req = new XMLHttpRequest()
		req.addEventListener('load', callback)
		req.open('GET', url)
		req.send()
	}

	function init () {

	  var me = this;
	  me.elements = $('div[data-type="fullcalview"]');

 	  me.elements.each(function(index){
      var elem = $(this);
			elem.data('eventlimit',			elem.data('eventlimit') || true);  //true, false
			elem.data('defaultview',		elem.data('defaultview') || 'basicWeek');  //alle verfügbaren Views auflisten
			elem.data('timeformat',			elem.data('timeformat') || 'H:mm');  //Format für Zeitangabe
			elem.data('lang',						elem.data('lang') || 'de');  //Länderkürzel für Sprache
			elem.data('weeknumbers',		elem.data('weeknumbers') || true);  //KW Anzeige
			elem.data('contentheight',	elem.data('contentheight') || 350);  //Höhe
			elem.data('contentwidth',		elem.data('contentwidth') || 600);  //Breite
			elem.data('headerleft',			elem.data('headerleft') || 'title');
			elem.data('headercenter',		elem.data('headercenter') || '');
			elem.data('headerright',		elem.data('headerright') || 'today month basicWeek basic-->Week prev,next');

			elem.append('<div id="calendar" style="margin: 5px;"></div>');
			var eventLimitVar				= elem.data('eventlimit');
			var defaultViewVar			= elem.data('defaultview');
			var timeFormatVar				= elem.data('timeformat');
			var langVar							= elem.data('lang');
			var weeknumbersVar			= elem.data('weeknumbers');
			var contentHeightVar		= elem.data('contentheight');
			var contentWidthVar			= elem.data('contentwidth');
			var headerLeftVar				= elem.data('headerleft');
			var headerCenterVar			= elem.data('headercenter');
			var headerRightVar			= elem.data('headerright');
			var eventdataUpdate = [];
			eventsources 				= ($.isArray(elem.data('device')) ? elem.data('device') : [elem.data('device')]);
			eventcolors 				= ($.isArray(elem.data('eventcolors')) ? elem.data('eventcolors') : [elem.data('eventcolors')]);
			eventtextcolors 			= ($.isArray(elem.data('eventtextcolors')) ? elem.data('eventtextcolors') : [elem.data('eventtextcolors')]);

			for (var n=0; n < eventsources.length; n++) {
				eventdataUpdate[n] = eventsources[n] + ':lastUpdate';
			}

			elem.data('get', eventdataUpdate);
			me.addReading(elem,'get');
			
			if((eventsources.length > 0 && eventcolors.length > 0 && eventtextcolors.length > 0) &&
			((eventsources.length == eventcolors.length) && (eventsources.length == eventtextcolors.length)))
			{
				$('#calendar').fullCalendar({
					eventLimit: eventLimitVar, // allow "more" link when too many events
					header:
					{
						left:   headerLeftVar,
						center: headerCenterVar,
						right:  headerRightVar
					},
					defaultView: defaultViewVar,
					timeFormat: timeFormatVar,
					lang: langVar,
					weekNumbers: weeknumbersVar,
					contentHeight: contentHeightVar,
					contentWidth: contentWidthVar
				});
			}
			else
				console.log('Invalid number of parameters number - please check your config.');
		});
	};

  function update (dev,par) {
		var me = this;
		me.elements.filterDeviceReading('get',dev,par).each(function(index) {
			for (var n=0; n < eventsources.length; n++) {
				if (eventsources[n] == dev && !firstRun[n])
				{
					(function(clsn){
						$('#calendar').fullCalendar('removeEvents', function(event) { return event.eID == eventsources[clsn];});
					})(n);
					
					(function(clsn){
						data_req('/fhem?detail='+eventsources[clsn]+'&dev.get'+eventsources[clsn]+'='+eventsources[clsn]+'&cmd.get'+eventsources[clsn]+'=get&arg.get'+eventsources[clsn]+'=vcalendar&val.get'+eventsources[clsn]+'=&XHR=1', function(e,r) {
							$('#calendar').fullCalendar('addEventSource', {
								events: fc_events(this.response, eventsources[clsn], eventcolors[clsn], eventtextcolors[clsn]),
							});
							if (!e) {
							}
						});
					})(n);
					
					firstRun[n] = true;
				}
				else {
					firstRun[n] = false;
				}
			}
		});
	};

  return $.extend(new Modul_widget(), {
      widgetname: 'fullcalview',
      init:init,
      update:update,
  });
}


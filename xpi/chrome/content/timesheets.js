/*- ***** BEGIN LICENSE BLOCK *****
  - Version: MPL 1.1/GPL 2.0/LGPL 2.1
  -
  - The contents of this file are subject to the Mozilla Public License Version
  - 1.1 (the "License"); you may not use this file except in compliance with
  - the License. You may obtain a copy of the License at
  - http://www.mozilla.org/MPL/
  -
  - Software distributed under the License is distributed on an "AS IS" basis,
  - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  - for the specific language governing rights and limitations under the
  - License.
  -
  - The Original Code is Timesheet Composer.
  -
  - The Initial Developer of the Original Code is INRIA.
  - Portions created by the Initial Developer are Copyright (C) 2010-2011
  - the Initial Developer. All Rights Reserved.
  -
  - Contributor(s):
  -    Fabien Cazenave <fabien@cazenave.cc>
  -
  - Alternatively, the contents of this file may be used under the terms of
  - either the GNU General Public License Version 2 or later (the "GPL"), or
  - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  - in which case the provisions of the GPL or the LGPL are applicable instead
  - of those above. If you wish to allow use of your version of this file only
  - under the terms of either the GPL or the LGPL, and not to allow others to
  - use your version of this file under the terms of the MPL, indicate your
  - decision by deleting the provisions above and replace them with the notice
  - and other provisions required by the LGPL or the GPL. If you do not delete
  - the provisions above, a recipient may use your version of this file under
  - the terms of any one of the MPL, the GPL or the LGPL.
  -
  - ***** END LICENSE BLOCK *****/

const htmlNS  = "http://www.w3.org/1999/xhtml";
const xulNS   = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
const SCENARI = false;
const DEBUG   = false;

var gDialog = {};       // UI elements
var gMediaPlayer;       // <audio|video> element
var gTimeCursor;        // div#timePos|div#timeSpan elements and methods
var gWaveform;          // <canvas> element and methods
var gTimeSegments = []; // time segment array
var gTimeController;
var gTimeContainer;

var cptTimeSegment = 0;

function startup() {
  gWaveform = document.getElementById("waveform");

  gTimeController = document.getElementById("timeController");
  gTimeController.addEventListener("update", redrawSegmentBlocks, false);
  gTimeController.addEventListener("middleclick", newSegment, false);

  gTimeContainer = document.getElementById("timeContainer");
  if (!SCENARI)
    gTimeContainer.setAttribute("hidetoolbar", "false");

  // media URLs
  gDialog.mediaBaseURI     = document.getElementById("mediaBaseURI");
  gDialog.mediaSource      = document.getElementById("mediaSource");
  gDialog.mediaWaveform    = document.getElementById("mediaWaveform");

  // params
  gDialog.downloadButton   = document.getElementById("downloadButton");
  gDialog.downloadProgress = document.getElementById("downloadProgress");

  // output
  gDialog.console          = document.getElementById("console");

  // content
  gDialog.content          = document.getElementById("content");
  gDialog.segmentTemplate  = document.getElementById("segmentTemplate");
  gDialog.xblFormTemplate  = document.getElementById("xblFormTemplate");
  //gDialog.timeSegments     = document.getElementById("timeSegments");
  gDialog.timeContainer    = document.getElementById("container");

  // thumbnails
  gDialog.sidebarLeft      = document.getElementById("sidebar-left");

 // consoleLog("startup");

  // disable right-click on all HTML elements
  // XXX I can't believe there's no better way to do that
  if (!DEBUG) {
    var elements = document.getElementsByTagNameNS(htmlNS, "*");
    for (var i = 0; i < elements.length; i++) {
      //elements[i].setAttribute("oncontextmenu", "return false;");
      elements[i].addEventListener("contextmenu", function(event) {
        if (/^html/i.test(event.target.nodeName))
          event.preventDefault();
      }, true);
      //elements[i].title = null;
    }
  }

  // Load default media files
  loadMediaFiles();
}

// time segments
function newDataForm(begin, end, cpt) {
  var dataForm = document.createElement("dataform");
  var vbox = document.getElementById("content");
  vbox.appendChild(dataForm);
  consoleLog(begin);
  dataForm.setAttribute("id","df:"+cpt);
  var cont = document.getElementById("content");
  for(var i = 0; i < cont.childNodes.length; i++)
  cont.childNodes[i].style.visibility="hidden";
  dataForm.setAttribute("style", "visibility=visible");
  return dataForm;
}
function newSegment() {
  
  //alert("test");
  
  //var sel   = gTimeController.selection;
  //var begin = Math.round(sel.begin * 100) / 100;
  //var end   = Math.round(sel.end   * 100) / 100;
  
  var begin = document.getElementById("mediaTime1").time;
  var end = document.getElementById("mediaTime2").time;
  
  var wave = document.getElementById("wave");
 // alert(wave.currentTime);
  
 // alert(wave.currentTime);
  
  //alert(sel);
  //alert(begin);
  //alert(end);
  
  if (begin == end)
    end = Infinity;

  cptTimeSegment++;
	
	
  // quick and dirty way
  //gTimeSegments.push(new timeSegment(begin, end, cptTimeSegment));

  gTimeContainer.add(begin, end, cptTimeSegment);
  //var form = newDataForm(begin, end, cptTimeSegment);
  //var thumb = new segmentThumb(begin, end, cptTimeSegment, gDialog.sidebarLeft);
  
  //alert(wave.currentTime);
  
  document.getElementById("mediaTime1").time = begin;
  wave.currentTime = document.getElementById("mediaTime1").time;
}

// thumbnails
function segmentThumb(begin, end, cpt, sidebar) {
	
  thumb = document.createElement("slide");
  sidebar.appendChild(thumb);
  thumb.setAttribute("id","thumb:"+cpt);
  
  
  var slideCurrent;
  var slide = document.getElementById("sidebar-left");
	
  for(var i = (slide.childNodes.length)-1; i >= 0; i--)
  {
	slideCurrent = slide.childNodes[i];
	if(slideCurrent.deb > begin)
	{
	  slide.insertBefore(thumb, slide.childNodes[i]);
	}
  }
	
  thumb.max = cpt;
  thumb.begin = begin;
  thumb.end = end;
	
  thumb.addEventListener('click',onClick,false);
	
  return thumb;
}
function timeupdatebegin(event)
{
  waveform.currentTime = mediaTime.time;
  drawOnChange(mediaTime.time,mediaTimeEnd.time);
}
function onClick(event) {
			  
	var elm = event.target;
	var idTemp = elm.getAttribute("id",0);
	var id2 = idTemp.split(":");
	var id = id2[1];
	
	//Affichage du Dataform
	var df = document.getElementById("df:"+id);
	var cont = document.getElementById("content");
	for(var i = 0; i < cont.childNodes.length; i++)
	  cont.childNodes[i].style.visibility="hidden";
	df.style.visibility="visible";
	
	//Récupération du timeNode et Slide
	var slide = document.getElementById("thumb:"+id);
	var timeNode = document.getElementById("timeNode:"+id);
	
	//On affiche en rouge uniquement le timeNode sélectionné
	var parentTimeNode = timeNode.parentNode;
	var i = 0;
	for(i; i < parentTimeNode.childNodes.length; i++)
	{
	  parentTimeNode.childNodes[i].className = "unselected";
	}
	//alert(timeNode.className);
	timeNode.className = "selected";
	//alert(timeNode.getAttribute("id",0));
	//alert(timeNode.className);
	
	//On affiche en rouge uniquement la slide sélectionnée
	//var hbox = document.getAnonymousElementByAttribute(slide, "anonid", "formslide");
	var parentThumb = slide.parentNode;
	var j = 0;
	for(j; j < parentThumb.childNodes.length; j++)
	{
	  //var hbox2 = document.getAnonymousElementByAttribute(parentThumb.childNodes[j], "anonid", "formslide");
	  parentThumb.childNodes[j].className = "unselected";
	}
	slide.className = "selected";
	
	//On redessine sur la waveform
	var waveform = document.getElementById("wave");
	
	var mediaTime = document.getElementById("mediaTime1");
	var mediaTime2 = document.getElementById("mediaTime2");
	
	var time1 = document.getElementById("time1");
	var time2 = document.getElementById("time2");
	
	var left  = Math.max(slide.deb,  waveform.begin);
	var right = Math.min(slide.fin, waveform.end);

	//alert(mediaTime.onTimeUpdate);
	//mediaTime.removeEventListener("timeupdate",  timeupdatebegin, false);
	//mediaTime.onTimeUpdate = null;
	//alert(mediaTime.timeupdate);
	//alert(mediaTime.ontimeupdate);
	//alert(mediaTime.onTimeUpdate);
	//for (i in mediaTime) {
    //  alert(i);
    //}
	//alert(mediaTime.change);
	//alert("test1");
	//mediaTime.removeEventListener("change", timeupdatebegin, false);
	//alert("test2");
	mediaTime.time = slide.deb;
	//mediaTime.addEventListener("timeupdate", timeupdatebegin, false);
	//alert("debutslide"+slide.deb);
	//alert("debut"+mediaTime.time);
	mediaTime2.time = slide.fin;
	//alert("finslide"+slide.fin);
	//alert("fin"+mediaTime2.time);
	
	if (left >= right) {
	  style.display = "none";
	} else {
	  var duration = waveform.end - waveform.begin;
	  var ratio = (right - left) / duration;
	  var offset = (left - waveform.begin) / duration;
	  time1.style.left  = (offset * 100) + "%";
	  time2.style.left  = (offset * 100) + "%";
	  time2.style.width = (ratio  * 100) + "%";
	}
	
  }
// convert seconds (float) to a time string (0:00 or 0:00:00)
function time2hms(time) {
  if (isNaN(time) || time >= Infinity || time == 0)
    return "";
  var seconds = Math.round(time * 100) / 100;
  var sec = seconds % 60;
  sec = Math.round(sec * 100) / 100;
  var str = sec;
  if (sec < 10)
    str = "0" + str;
  var minutes = Math.floor(seconds / 60);
  var min = minutes % 60;
  str = min + ":" + str;
  if (!gMediaPlayer || (gMediaPlayer.duration < 3600)) return str;
  if (min < 10)
    str = "0" + str;
  var h = Math.floor(minutes / 60);
  str = h + ":" + str;
  return str;
}
function hms2time(hms) {
  var seconds = 0;
  var tmp = hms.split(":");
  for (var i = 0; i < tmp.length; i++)
    seconds = (seconds * 60) + parseFloat(tmp[i]);
  return seconds;
}

// test
function scrollTest(event) {
  //console.log(event);
  //console.log(event.detail);
  var scroll = document.getElementById("scrollTest");
  //consoleLog(scroll.scrollLeft);
}
// main 'timeSegment' object
function timeSegment(begin, end, cpt) {

  //consoleLog("new: " + begin + " → " + end);
  const self = this;

  //this.begin = begin;
  //this.end   = end;

  //this.time_in  = begin;
  //this.time_out = end;
  
  // append a XUL groupbox in #content
  //var controls = new segmentControls(this, begin, end);
  //gDialog.content.appendChild(controls.main);

  // append an HTML segment in #timeSegments
  //var block = new segmentBlock(this, begin, end);
  //gDialog.timeSegments.appendChild(block.main);
  //gDialog.timeSegments.setAttribute("width","15%");

  // append a thumbnail in #sidebar-left
  alert("test");
	
  //var thumb = new segmentThumb(begin, end, cpt, gDialog.sidebarLeft);
  //gDialog.sidebarLeft.appendChild(thumb);

  this.update = function(aBegin, aEnd) {
    self.begin = aBegin;
    self.end   = aEnd;
    block.update();
    computeTimeNodes();
   
    updateCursor();
   
  };

  // event handlers
  function updateCursor() {
    //gTimeCursor.setBegin(self.time_in);
    //gTimeCursor.setEnd(self.time_out);
    //gMediaPlayer.currentTime = self.time_in;
    gTimeController.select(self.time_in, self.time_out);
    gTimeController.currentTime = self.time_in;
  }

  // event handlers :: segmentBlock
  block.begin.onclick = function() {
    // TODO
  };
  block.end.onclick = function() {
    // TODO
  };
  block.main.addEventListener("mouseup", function(event) {
    switch (event.button) {
      case 0:
        controls.focus();
        thumb.focus();
        updateCursor();
        break;
      case 1:
        //consoleLog("delete current time node");
        delSegment(self);
        break;
    }
  }, false);
  block.main.addEventListener("dblclick", function(event) {
   // consoleLog("select current time node");
    updateCursor();
    //gTimeCursor.zoomIn();
    gTimeController.zoomIn();
  }, false);

  // event handlers :: segmentControls
 /* controls.begin.oninput = function() {
    var value = hms2time(this.value);
    consoleLog("update: " + value);
    self.update(value, self.end);
  };
  controls.end.oninput = function() {
    var value = hms2time(this.value);
    consoleLog("update: " + value);
    self.update(self.begin, value);
  };
  controls.data.onfocus = function() {
    block.focus();
    updateCursor();
  };
  controls.data.onblur = function() {
    block.blur();
  };

  // focus the new time node
  controls.data.focus();
  controls.data.select();

  // expose 'controls' and 'block'
  this.controls = controls;*/
  this.block    = block;
   
}
function consoleLog(message) {
  gDialog.console.value += message + "\n" ;
}
// load media source and waveform
function loadMediaFiles(aForceReload) {
  var baseURL = gDialog.mediaBaseURI.value;
  gTimeController.media.src    = baseURL + gDialog.mediaSource.value;
  gTimeController.waveform.src = baseURL + gDialog.mediaWaveform.value;
  // gWaveform.src                = baseURL + gDialog.mediaWaveform.value;
  if (aForceReload) {
    gTimeController.waveform.load();
    // gWaveform.load();
  }
}
function delSegment(timeSegment) {
  /*var i = gTimeSegments.indexOf(timeSegment);
  if (i >= 0) {
    var ctrl = gTimeSegments[i].controls;
    var blck = gTimeSegments[i].block;
    ctrl.main.parentNode.removeChild(ctrl.main);
    blck.main.parentNode.removeChild(blck.main);
    gTimeSegments.splice(i, 1);
  }*/
}
function sortSegments() {
  /*var swap, data1, data2;
  do { // there are few items, we can do a lazy bubble sort
    swap = false;
    for (var i = 0; i < gTimeSegments.length - 1; i++) {
      //consoleLog("order #" + i);
      var curr = gTimeSegments[i];
      var next = gTimeSegments[i+1];
      if (curr.begin > next.begin) { // swap these two items
        //consoleLog("swap #" + i);
        data1 = curr.controls.data.value;
        data2 = next.controls.data.value;
        gDialog.content.insertBefore(next.controls.main, curr.controls.main);
        gDialog.timeSegments.insertBefore(next.block.main, curr.block.main);
        curr.controls.data.value = data1;
        next.controls.data.value = data2;
        gTimeSegments[i]   = next;
        gTimeSegments[i+1] = curr;
        swap = true;
      }
    }
  } while(swap);*/
}
// <groupbox> control for the #content container
function segmentControls(parent, begin, end) {
  var self = this;

  // TODO design an XBL instead of this ugly thing
  this.main  = gDialog.segmentTemplate.cloneNode(true);
  this.begin = this.main.getElementsByTagName("textbox").item(0);
  this.end   = this.main.getElementsByTagName("textbox").item(1);
  this.data  = this.main.getElementsByTagName("textbox").item(2);

  this.main.removeAttribute("id");
  this.main.removeAttribute("hidden");
  this.begin.setAttribute("value", time2hms(begin));
  this.end.setAttribute("value", time2hms(end));

  function hmsFormat() {
    if (/^[0-9]*[\.]{0,1}[0-9]*$/.test(this.value))
      this.value = time2hms(this.value);
  }
  this.begin.onchange = hmsFormat;
  this.end.onchange   = hmsFormat;

  this.focus = function () {
    //consoleLog(self.data.value);
    self.data.focus();
  };
  this.blur = function () {
    self.data.blur();
  };
}
// <hbox> block for the #timeSegments container
function segmentBlock(parent, begin, end) {
  var self = this;

  // note: the 'main' element could be an <html:div> block
  // but the contextual menu wouldn't work (see 'context' attribute)
  this.main  = document.createElementNS(xulNS, "hbox"); // main block
  this.begin = document.createElementNS(htmlNS, "div"); // left handle
  this.end   = document.createElementNS(htmlNS, "div"); // right handle

  this.begin.className = "handle-left";
  this.end.className   = "handle-right";
  this.main.appendChild(this.begin);
  this.main.appendChild(this.end);
  if (!SCENARI)
    this.main.setAttribute("context", "transition");

  this.draw = function (aWaveformBegin, aWaveformEnd) {
    var left  = Math.max(parent.time_in,  aWaveformBegin);
    var right = Math.min(parent.time_out, aWaveformEnd);

    if (left >= right) {
      self.main.style.display = "none";
    } else {
      var duration = aWaveformEnd - aWaveformBegin;
      var ratio = (right - left) / duration;
      var offset = (left - aWaveformBegin) / duration;
      //self.main.style.left  = (offset * gTimeCursor.width) + "px";
      //self.main.style.width = (ratio  * gTimeCursor.width) + "px";
      self.main.style.left  = (offset * 100) + "%";
      self.main.style.width = (ratio  * 100) + "%";
      self.main.style.display = "block";
    }
  };
  this.update = function () {
    self.draw(gTimeController.begin, gTimeController.end);
  };
  this.update();

  this.focus = function () {
    self.main.className = "active";
  };
  this.blur = function () {
    self.main.removeAttribute("class");
  };

  // Event listeners: begin/end drag
  function onClick(event) {
  }
  function onResize(event) {
    return; // XXX
    if (event.button) return;
    var begin = mediaPlayer.currentTime;
    var end = getTimePosition(event);
    //self.setDur(end - begin);
    if (end > begin)
      self.setEnd(end);
    else
      self.setBegin(end);
  }
  this.begin.addEventListener("mousedown", function(event) {
    onClick(event);
    self.begin.addEventListener("mousemove", onResize, false);
  }, false);
}
// redraw time blocks
function redrawSegmentBlocks(event) {
 // consoleLog("<" + event.target.nodeName + "> redraw");
  //var begin = event.target.begin; // == gTimeController.begin
  //var end   = event.target.end;   // == gTimeController.end
  var begin = event.begin; // == waveform.begin
  var end   = event.end;   // == waveform.end
  //alert(begin+" - "+end);
  //consoleLog(begin + " → " + end);
  /*for (var i = 0; i < gTimeSegments.length; i++) {
    gTimeSegments[i].block.draw(begin, end);
  }*/
  gTimeContainer.draw(begin, end);
}
function computeTimeNodes() { // XXX
  sortSegments();
  if (!gDialog.timeContainer) return;
  var timeContainer = gDialog.timeContainer.value;
  //consoleLog(timeContainer);
  /*for (var i = 0; i < gTimeSegments.length - 1; i++) {
    var out;
    var end = gTimeSegments[i].end;
    //if (!end.length) end = Infinity;
    //consoleLog("end = " + end);
    if ((timeContainer == "par") || (end < gTimeSegments[i+1].begin))
      out = gTimeSegments[i].end;
    else
      out = gTimeSegments[i+1].begin;
    gTimeSegments[i].time_in = gTimeSegments[i].begin;
    gTimeSegments[i].time_out = out;
    gTimeSegments[i].block.update();
  }*/
  //redrawSegmentBlocks(gTimeController.begin, gTimeController.end);
  redrawSegmentBlocks();
}
//document.getElementById("scrollTest").addEventListener("scroll", scrollTest, false);


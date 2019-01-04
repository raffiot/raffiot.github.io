var s, canvas, $GP;
var config={};
var conf;

function GetQueryStringParams(sParam,defaultVal) {
    var sPageURL = ""+window.location;//.search.substring(1);//This might be causing error in Safari?
    if (sPageURL.indexOf("?")==-1) return defaultVal;
    sPageURL=sPageURL.substr(sPageURL.indexOf("?")+1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return defaultVal;
}

jQuery.getJSON(GetQueryStringParams("config","config.json"), function(data, textStatus, jqXHR) {
	config=data;
	//As soon as page is ready (and data ready) set up it
  $(document).ready(initSigma(config));
});


function initSigma(config) {
	var data=config.data;
	conf = config;

  var a = new sigma({
  container: 'graph-container',
  renderer: {
    container: 'graph-container',
    type: sigma.renderers.webGL,
  }
  });
  a.settings(config.settings);
  s = a;
  configNeighbors();
	showInfo();
	
  sigma.parsers.json(data,a,dataReady);
  s.settings('labelThreshold',20);
  s.cameras[0].goTo({ x: 0, y: 300, angle: 0, ratio: 4 });

}

function configNeighbors(){
  s.bind('clickNode', function(e) {
    var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;

    s.graph.nodes().forEach(function(n) {
      if (toKeep[n.id])
        n.color = n.originalColor;
      else
        n.color = '#eee';
    });

    s.graph.edges().forEach(function(e) {
      if (toKeep[e.source] && toKeep[e.target])
        e.color = e.originalColor;
      else
        e.color = '#eee';
    });

    s.refresh();
  });

  s.bind('clickStage', function(e) {
    s.graph.nodes().forEach(function(n) {
      n.color = n.originalColor;
    });

    s.graph.edges().forEach(function(e) {
      e.color = e.originalColor;
    });

    s.refresh();
  });
}

function showInfo(){
	s.bind('clickNode', function(e) {
		currentNode = e.data.node;
		var nodeId = currentNode.label;
		var nodeActivity = currentNode['user_activity'+suffix][current_activity_index][0];
		var nodeCategory = e.data.node.attributes.category;
		var div = document.querySelector("div#info");
		div.innerHTML = '';

		var nodeIDHTML = document.createElement("h5");
		var text = document.createTextNode(nodeId);
		nodeIDHTML.id ="nodeId";
		nodeIDHTML.appendChild(text);
		div.appendChild(nodeIDHTML);
		
		var nodeDateHTML = document.createElement("h5");
		var text2 = document.createTextNode("user activity on "+currentDate+": "+nodeActivity);
		nodeDateHTML.id = "nodeDate";
		nodeDateHTML.appendChild(text2);
		div.appendChild(nodeDateHTML);
		
		/* var nodeCategoryHTML = document.createElement("h5");
		var text3 = document.createTextNode("category "+nodeCategory);
		nodeCategoryHTML.id="nodeCategory";
		nodeCategoryHTML.appendChild(text3);
		div.appendChild(nodeCategoryHTML); */
	});
	
	s.bind('clickStage', function(e) {
		var div = document.querySelector("div#info");
		div.innerHTML = '';
		currentNode = undefined;
    });
}


var forceAtlas2Active = false;
var dates = [];
var currentDate = "";
var currentNode;
var current_activity_index = 0;
var oldFactor = 1;
var suffix = "";

function dataReady(){
	var container_element = document.querySelector("div#timeline_div");
	var slider = document.createElement("input");
	slider.className = "slider";
	slider.id = "myRange";
	slider.type = "range";
	slider.min = 0;
	var one_node = s.graph.nodes()[0];
	slider.max = one_node.user_activity.length - 1;
	slider.value = one_node.user_activity.length;

	container_element.appendChild(slider);

	slider.addEventListener("input",sliderFunc);

	slider.value = 0;

	for(var i=0; i <one_node.user_activity.length; i++){
		dates.push(one_node.user_activity[i][1]);
	}
	

	currentDate= dates[0].substring(0, 7);
	
	
	var slider_span = document.createElement("span");
	slider_span.className = "setyear";
	slider_span.id = "slider_span";
	slider_span.innerHTML = currentDate;
	
	
	const thumbSize = 10;
	var span_poz = thumbSize / 10;
	slider_span.style.left = Number(0) +'px';
	container_element.appendChild(slider_span);
	
	document.querySelector("input#scaleChoice2").checked = false;
	document.querySelector("input#scaleChoice1").checked = true;
	document.querySelector("input#mean").checked = false;
	document.querySelector("input#meanstd").checked = false;
	document.querySelector("input#wiki_fr").checked = false;
	//document.querySelector("input#scaleFactor").value = 1;
	
	document.querySelector("input#scaleChoice2").addEventListener("change",logscale);
	document.querySelector("input#scaleChoice1").addEventListener("change",powscale);
  document.querySelector("input#mean").addEventListener("change",mean);
  document.querySelector("input#meanstd").addEventListener("change",meanstd);
  document.querySelector("input#wiki_fr").addEventListener("change",wiki_fr);
  document.querySelector("button#timeline").addEventListener("click",timeline);
  //document.querySelector("input#scaleFactor").addEventListener("input",scaleFactor);
  
  document.querySelector("button#start_button").addEventListener("click",animate_position);
  s.refresh();
	/**
  var noverlapListener = s.configNoverlap({
    nodeMargin: 0.1,
    scaleNodes: 1.05,
    gridSize: 75
  });
  // Bind the events:
  noverlapListener.bind('start stop interpolate', function(e) {
    console.log(e.type);
    if(e.type === 'start') {
      console.time('noverlap');
    }
    if(e.type === 'interpolate') {
      console.timeEnd('noverlap');
    }
  });
  // Start the layout:
  s.startNoverlap();*/
}

function sliderFunc(){
	
	
	
	var val = document.querySelector("input#myRange").value;
	var min = document.querySelector("input#myRange").min;
	var max = document.querySelector("input#myRange").max;
	current_activity_index = val;
	
	const thumbSize = 80;
	const slider_span = document.querySelector('span#slider_span');
	div_width = document.getElementById("timeline_div").offsetWidth
	const ratio = (val - min) / (max - min);
	var span_poz =  ratio * div_width - ratio * thumbSize;
	slider_span.style.left = Number(span_poz) +'px';

	/**
	s.graph.nodes().forEach(function(n) {
		n.size = n.user_activity[val][0];
	});*/
	
	sigma.plugins.animate(
    s,
    {
      size: val + '_size'+suffix
    },
	{
		onComplete: function(){
			s.refresh();
		}
	}
	);
	
	
	currentDate= dates[val].substring(0, 7);
	slider_span.innerHTML= currentDate;
	if (currentNode != undefined){
		document.querySelector("h5#nodeDate").innerHTML= "user activity on "+currentDate+": "+currentNode['user_activity'+suffix][val][0];
	}
	s.refresh();
}

var stop = true;
async function timeline(){
	stop = !stop;
	if (stop){
		return;
	}
	 var slider = document.querySelector("input#myRange");
	 var max = slider.max;
	 var currentVal = parseInt(slider.value);
	 slider.disabled = true;
	 document.querySelector("button#timeline").style.color = "#ff3300";
	 document.querySelector("button#timeline").innerHTML = '&#9646 Stop timeline';
	 for(var i=currentVal; i < max; i++){
		slider.value= parseInt(slider.value)+1;
		sliderFunc();
		await sleep(2000);
		if(stop){
			stop = true;
			slider.disabled = false;
			document.querySelector("button#timeline").style.color = "#00b33c";
			document.querySelector("button#timeline").innerHTML = '&#9658 Play timeline';
			return;
		}
		
	 }
	 console.log("here");
	 slider.disabled = false;
	 slider.value= parseInt(slider.value)+1;
	 document.querySelector("button#timeline").style.color = "#00b33c";
	 document.querySelector("button#timeline").innerHTML = '&#9658 Play timeline';
	 
	 
	 
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function animate_position(){

	var element = document.getElementById("start_div").remove();
	let cam = s.camera;
	let aNode = s.graph.nodes()[0]
	prefix ='correct_';	
	sigma.utils.zoomTo(
		cam,                        // cam
		aNode[prefix + 'x'] - cam.x,   // x
		aNode[prefix + 'y'] - cam.y,   // y
		0.3,                         // ratio
	{'duration': 1000}          // animation
	);
	
	
	sigma.plugins.animate(
    s,
    {
      x: prefix + 'x',
      y: prefix + 'y',
      size: prefix + 'size',
	  color: prefix + 'color'
    },
	{
		onComplete: function(){
			s.settings('labelThreshold',conf.settings.labelThreshold);
			s.refresh();
		}
	}
  );

}

function logscale(){

	var regex = new RegExp('[0-9]+_size');
	
	s.graph.nodes().forEach(function(n) {
		for (var property in n) {
			if(regex.test(property)){
				n[property] = Math.log2(n[property]);
			}
		}
		n.size = Math.log2(n.size);

	});
	s.refresh(); 
}

function mean(){
	var b = this.checked
	var regex = new RegExp('[0-9]+_size');
	var regex_fr = new RegExp('fr');
	
	s.graph.nodes().forEach(function(n) {
		for (var property in n) {
			if(regex.test(property)){
				if (regex_fr.test(property)){
					if(b){
						n[property] = n[property] - n['activity_mean_fr'];
					} else {
						n[property] = n[property] + n['activity_mean_fr'];
					}
				} else {
					if(b){
						n[property] = n[property] - n['activity_mean'];
					} else {
						n[property] = n[property] + n['activity_mean'];
					}
				}
			} 
		}
		if(b){		
			n.size = n.size - n['activity_mean'+suffix];
		} else {
			n.size = n.size + n['activity_mean'+suffix];
		}

	});

	s.refresh();
}

function meanstd(){
	var b = this.checked
	var regex = new RegExp('[0-9]+_size');
	var regex_fr = new RegExp('_fr');
	
	s.graph.nodes().forEach(function(n) {
		for (var property in n) {
			if(regex.test(property)){
				if (regex_fr.test(property)){
					if(b){
						n[property] = (n[property] - n['activity_mean_fr']) / n['activity_std_fr'];
					} else {
						n[property] = (n[property] * n['activity_std_fr']) + n['activity_mean_fr'];
					}
				} else {
					if(b){
						n[property] = (n[property] - n['activity_mean']) / n['activity_std'];
					} else {
						n[property] = (n[property] * n['activity_std']) + n['activity_mean'];
					}
				}
			} 
		}
		if(b){		
			n.size = (n.size - n['activity_mean'+suffix]) / n['activity_std'+suffix];
		} else {
			n.size = (n.size * n['activity_std'+suffix]) + n['activity_mean'+suffix];
		}

	});

	s.refresh();
}

function powscale(){

	var regex = new RegExp('[0-9]+_size');
	
	s.graph.nodes().forEach(function(n) {
		for (var property in n) {
			if(regex.test(property)){
				n[property] = Math.pow(2,n[property]);
			}
		}
		n.size = Math.pow(2,n.size);
	});

	s.refresh();
}

function wiki_fr(){
	
	if (suffix == ""){
		s.graph.nodes().forEach(function(n) {
			n.label = n['label_fr'];
			n.size = n[current_activity_index+'_size_fr'];
		});
		suffix = '_fr';
	} else {
		s.graph.nodes().forEach(function(n) {
			n.label = n['label_en'];
			n.size = n[current_activity_index+'_size'];
		});
		suffix = '';		
	}
	
	if (currentNode != undefined){
		if (currentNode['label_fr'] == 'unknown' && suffix=='_fr'){
			s.dispatchEvent('clickStage');
		} else{
			document.querySelector("h5#nodeId").innerHTML= currentNode['label'];
			document.querySelector("h5#nodeDate").innerHTML= "user activity on "+currentDate+": "+currentNode['user_activity'+suffix][current_activity_index][0];
		}
	}
	
	s.refresh();
	
}
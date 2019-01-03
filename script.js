var diseases_info = ' <p>This dataset is composed by every wikipedia pages that are at depth 2 from <a href="https://en.wikipedia.org/wiki/Category:Lists_of_diseases">disease</a> wikipedia page. <br />'
		 +' It includes both English and French wikipedia</p>'
		 + '<ul>'
		 +		'<li>Wikipedia pages: 1.385</li> '
		 +		'<li>Hyperlinks: 20.460</li>'
		 +'</ul>'
		 +'<center>'
		 +'<img src="./images/diseases_overview.png" alt="visualisation preview" height="50%" width="50%">'
		 +'<br/>'
		 +"<a href='./diseases/viz.html' rel='noopener noreferrer' target='_blank'>Visualise</a>"
		 +'</center>';
					
var wikispedia_info = '<p>This dataset is composed by science pages that are part of <a href="https://snap.stanford.edu/data/wikispeedia.html">wikispedia</a> dataset <br />'
					 +' It includes both English and French wikipedia</p>'
					 +'<ul>'
					 +'<li>Wikipedia pages: 1.097</li>'
					 +'<li>Hyperlinks: 13.971</li>'
					 +'</ul>'			
					 +'<center>'
					 +'<img src="./images/wikispedia_overview.png" alt="visualisation preview" height="50%" width="50%">'
					 +'<br/>'
					 +"<a href='./wikispedia/viz.html' rel='noopener noreferrer' target='_blank'>Visualise</a>"
					 +'</center>';

var century_info = '<p>This dataset is composed by every wikipedia pages that are at depth 2 from <a href="https://en.wikipedia.org/wiki/Category:20th_century">XX century</a> wikipedia page <br />'
				 +' It includes both English and Spanish wikipedia </p>'
				 +'<ul>'
				 +'<li>Wikipedia pages: 824</li>'
				 +'<li>Hyperlinks: 11.320</li>'
				 +'</ul>'
				 +'<center>'
				 +'<img src="./images/XX_century_overview.png" alt="visualisation preview" height="50%" width="50%">'
				 +'<br/>'
				 +"<a href='./XX_century/viz.html' rel='noopener noreferrer' target='_blank'>Visualise</a>"
				 +'</center>';
document.querySelector("select#choose_vis").addEventListener("change",selectVis)
function selectVis(){
	var choosed_vis = document.querySelector("select#choose_vis").value;
	var info = document.querySelector("div#vis-info");
	console.log(choosed_vis);
	switch(choosed_vis){
		case "diseases":
			info.innerHTML = diseases_info;
			break;
		case "science":
			info.innerHTML = wikispedia_info;
			break;
		case "XX_century":
			info.innerHTML = century_info;
			break;
	}
}
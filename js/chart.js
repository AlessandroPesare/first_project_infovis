/**
 * Crea un file json con dei dati bivariati: ci sono 10 data-case e ogni data-case ha due variabili quantitative.
 * Prima disegna questo dataset tramite un bar chart in cui la prima variabile quantitativa è utilizzata per l'altezza
 * delle barre e la seconda variabile quantitativa è utilizzata per la tonalità di colore delle barre.
 * Facendo click con il pulsante sinistro del mouse su una barra i due valori per quella barra specifica si scambiano:
 * la prima variabile viene utilizzata per la tonalità di colore e la seconda per l'altezza.
 * Continuando a cliccare si possono trasformare tutte le barre e, volendo, tornare alla situazione iniziale.
 * Fai in modo che le transizioni avvengano con un'animazione fluida.
 * Usa le scale d3.js per mappare il dominio dei valori delle variabili (che è arbitrario) sul range dei valori
 * delle grandezze geometriche (che dipende dalla larghezza della finestra e dalla metafora di rappresentazione). 
 */
var margin = {top: 20, right: 20, bottom: 20, left:40}; // to memorize the margins

var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// x is the scale for x-axis
var xScale = d3.scaleBand()         // ordinal scale
        .rangeRound([0, width])    
	.padding(.1);               // between the bands

// y is the scale for y-axis
var yScale = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(xScale);  		
var yAxis = d3.axisLeft(yScale).ticks(15); 

var colorScale = d3.scaleOrdinal()
      .range(["#ff0000", "#00ff00", "#0000ff"]);

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)     
    .attr("height", height + margin.top + margin.bottom)   
    .append("g")                                          
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");                                                    


function setXScaleDomain(data) {
    data.sort(function(a, b) {
        return a.year - b.year;
      });
    xScale.domain(data.map(function(d) { return d.year}));
}
    
function setYScaleDomain(data){
    yScale.domain([0, d3.max(data, function(d) { return d.value; })]);
}

function drawAxes(){

    // draw the x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // draw the y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}
//event è l'evento, d rappresenta i dati associati all'evento cliccato
function handleClick(event,d) {
  var clickedBar = d3.select(this);
  var clickedData = clickedBar.datum();

  // Crea una copia dell'oggetto dati
  var newData = Object.assign({}, clickedData);

  // Inverti i valori delle variabili quantitative nella copia
  var tempValue = newData.value;
  newData.value = newData.year;
  newData.year = tempValue;

  // Aggiorna la barra con i nuovi valori
  clickedBar
    .datum(newData)
    .transition()
    .duration(500)
    .attr("y", function(d) { return yScale(d.value); })
    .attr("height", function(d) { return height - yScale(d.value); })
    .attr("fill", function(d) { return colorScale(d.year); });

  // Aggiorna le scale con i nuovi valori
  setYScaleDomain(svg.selectAll(".bar").data());
  setXScaleDomain(svg.selectAll(".bar").data());

  // Aggiorna gli assi
  svg.select(".x.axis")
    .transition()
    .duration(500)
    .call(xAxis);

  svg.select(".y.axis")
    .transition()
    .duration(500)
    .call(yAxis);
  }

function updateChart(data) {
    setYScaleDomain(data);
    setXScaleDomain(data);
  
    var bars = svg.selectAll(".bar").data(data,function(d) { return d.year; });
    
    // Enter clause: add new elements
    var newBars = bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.year); })
      .attr("width", xScale.bandwidth())
    
    bars = newBars.merge(bars);

    bars.transition()
    .duration(500)
    .attr("y", function (d) { return yScale(d.value); })
    .attr("height", function (d) { return height - yScale(d.value); })
    .attr("fill", function(d) { return colorScale(d.year); });
    bars
    .on("click",handleClick);
    }


d3.json("data/dataset.json")
	.then(function(data) {
        setYScaleDomain(data);
        setXScaleDomain(data);
        drawAxes();
    	  updateChart(data);
   	})
	.catch(function(error) {
		console.log(error); // Some error handling here
  	});

var margin = {top: 20, right: 20, bottom: 20, left: 40};
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var xScale = d3.scaleBand()
  .rangeRound([0, width])
  .padding(0.1);

var yScale = d3.scaleLinear()
  .range([height, 0]);

var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale).ticks(15);

var colorScale = d3.scaleOrdinal()
  .range(["#ff0000", "#00ff00", "#0000ff"]);

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function setXScaleDomain(data) {
  xScale.domain(data.map(function(d) { return d.year; }));
}

function setYScaleDomain(data) {
  yScale.domain([0, d3.max(data, function(d) { return d.value; })]);
}

function drawAxes() {
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
}

function handleClick(event, d) {
  var clickedBar = d3.select(this);
  var clickedData = clickedBar.datum();

  var newData = Object.assign({}, clickedData);
  var tempValue = newData.value;
  newData.value = newData.year;
  newData.year = tempValue;

  var maxValue = d3.max(svg.selectAll(".bar").data(), function(d) {
    return Math.max(d.value, d.year);
  });

  if (newData.value > maxValue) {
    yScale.domain([0, newData.value]);
  } else {
    yScale.domain([0, maxValue]);
  }

  clickedBar
    .datum(newData)
    .transition()
    .duration(500)
    .attr("y", function(d) { return yScale(d.value); })
    .attr("height", function(d) { return height - yScale(d.value); })
    .attr("fill", function(d) { return colorScale(d.year); });

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

  var bars = svg.selectAll(".bar").data(data, function(d) {
    return d.year;
  });

  var newBars = bars.enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.year); })
    .attr("width", xScale.bandwidth());

  bars = newBars.merge(bars);

  bars.transition()
    .duration(500)
    .attr("y", function(d) { return yScale(d.value); })
    .attr("height", function(d) { return height - yScale(d.value); })
    .attr("fill", function(d) { return colorScale(d.year); });

  bars.on("click", handleClick);
}

d3.json("data/dataset.json")
  .then(function(data) {
    setXScaleDomain(data);
    setYScaleDomain(data);
    drawAxes();
    updateChart(data);
  })
  .catch(function(error) {
    console.log(error);
  });

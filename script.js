// Add a container div to center the content
d3.select("body")
  .append("div")
  .attr("id", "container")
  .style("display", "flex")
  .style("flex-direction", "column")
  .style("align-items", "center")
  .style("justify-content", "center")
  .style("height", "100vh"); // Full viewport height

// Append title to the container
d3.select("#container")
  .append("h1")
  .text("Monthly Global Land-Surface Temperature")
  .style("text-align", "center")
  .style("font-family", "Arial")
  .style("font-size", "24px");

// Append subtitle to the container
d3.select("#container")
  .append("h2")
  .text("1753 - 2015: Base temperature 8.66℃")
  .style("text-align", "center")
  .style("font-family", "Arial")
  .style("font-size", "18px");

// Set up margins and dimensions
const margin = { top: 50, right: 50, bottom: 150, left: 100 };
const width = 1200 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Create SVG element and append it to the container
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up scales
const xScale = d3
  .scaleTime()
  .domain([new Date(1753, 0, 1), new Date(2015, 0, 1)])
  .range([0, width]);

const yScale = d3.scaleBand().domain(d3.range(1, 13)).range([0, height]);

// ... (previous code remains the same)

// Create and append x-axis
const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(10));

svg
  .append("g")
  .attr("id", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

// Add x-axis label
svg
  .append("text")
  .attr("class", "x-axis-label")
  .attr("text-anchor", "middle")
  .attr("x", width / 2 + 20)
  .attr("y", height + 60)
  .text("Year")
  .style("font-family", "Arial")
  .style("font-size", "16px")
  .style("font-weight", "bold");

// Create and append y-axis
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => d3.timeFormat("%B")(new Date(0, d - 1)));

svg.append("g").attr("id", "y-axis").call(yAxis);

// Add y-axis
svg
  .append("text")
  .attr("class", "y-axis-label")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 20)
  .attr("x", -height / 2)
  .text("Month")
  .style("font-family", "Arial")
  .style("font-size", "16px")
  .style("font-weight", "bold");

// Style grid lines
d3.selectAll(".grid line")
  .style("stroke", "lightgrey")
  .style("stroke-opacity", "0.7")
  .style("shape-rendering", "crispEdges");

d3.selectAll(".grid path").style("stroke-width", "0");

// Create tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #ccc")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("pointer-events", "none")
  .style("opacity", 0);

// Fetch data and create the heatmap
fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    const baseTemperature = data.baseTemperature;
    const colors = [
      "steelblue",
      "skyblue",
      "lightgreen",
      "orange",
      "lightcoral",
    ];

    // Create heatmap cells
    svg
      .selectAll(".cell")
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(new Date(d.year, 0, 1)))
      .attr("y", (d) => yScale(d.month))
      .attr("width", width / (2015 - 1753))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => {
        const temp = baseTemperature + d.variance;
        return temp > 15
          ? "lightcoral"
          : temp > 12
          ? "orange"
          : temp > 9
          ? "lightgreen"
          : temp > 6
          ? "skyblue"
          : "steelblue";
      })
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemperature + d.variance)
      .on("mouseover", function (event, d) {
        d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        tooltip
          .style("opacity", 1)
          .attr("data-year", d.year)
          .html(
            `<strong>Year:</strong> ${d.year}<br>
             <strong>Month:</strong> ${d3.timeFormat("%B")(
               new Date(0, d.month - 1)
             )}<br>
             <strong>Temperature:</strong> ${(
               baseTemperature + d.variance
             ).toFixed(2)}&deg;C<br>
             <strong>Variance:</strong> ${d.variance.toFixed(2)}&deg;C`
          )
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke", "none");
        tooltip.style("opacity", 0);
      });

    // Create legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0, ${height + 50})`);

    const legendColors = [
      "steelblue",
      "skyblue",
      "lightgreen",
      "orange",
      "lightcoral",
    ];
    const legendLabels = [
      "< 6°C",
      "6 - 9°C",
      "9 - 12°C",
      "12 - 15°C",
      "> 15°C",
    ];
    const legendWidth = 60;
    const legendHeight = 20;
    const legendSpacing = 40;

    // Add legend rectangles
    legend
      .selectAll("rect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth + legendSpacing))
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", (d) => d);

    // Add legend labels
    legend
      .selectAll("text")
      .data(legendLabels)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * (legendWidth + legendSpacing) + legendWidth / 2)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "middle")
      .text((d) => d);
  })
  .catch((error) => console.error("Error fetching data:", error));

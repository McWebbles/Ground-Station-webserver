//To update time in GUI
function updateTime() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;
  console.log(formattedTime);
  document.getElementById("24-hour-time").textContent = formattedTime;
}

//Get Mission Name from config.csv file - update GUI
d3.csv("../csv/config.csv").then(function (data) {
  const test = data[0].Config;
  document.getElementById("mission-name").textContent = test;
});

//Get Maximum and Current Altitude - update GUI
function getMaxAltitude() {
  d3.csv("../csv/BR_low_rate.csv").then(function (data) {
    data.forEach((d) => {
      d.Baro_Altitude_AGL = +d.Baro_Altitude_AGL;
    });
    //Update Maximum Altitude
    document.getElementById("max-altitude").textContent =
      "Max Altitude: " +
      parseFloat(d3.max(data, (d) => d.Baro_Altitude_AGL)).toFixed(2) +
      " Feet   || " +
      parseFloat(d3.max(data, (d) => d.Baro_Altitude_AGL) * 0.3048).toFixed(2) +
      " Meters";

    //Update Current Altitude
    document.getElementById("altitude-feet").textContent =
      parseFloat(data[data.length - 1].Baro_Altitude_AGL).toFixed(2) + " Feet";
    document.getElementById("altitude-meters").textContent =
      parseFloat(data[data.length - 1].Baro_Altitude_AGL * 0.3048).toFixed(2) +
      " Meters";
  });
}

////////////////////////////////////////////////////////////////////////////////////////

// Define Graph varants

var margin = { top: 20, right: 0, bottom: 35, left: 40 };
var width = 200 - margin.left - margin.right;
var height = 220 - margin.top - margin.bottom;

// Set up the x and y scales

var x = d3.scaleTime().range([0, width]);

var y = d3.scaleLinear().range([height, 0]);

/////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// LOW ACCEL GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

//accel_low_svg.remove();
// // Load and Process AV_Data

d3.csv("./csv/data_highres.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.count = +d.count;
    d.Accel_X = +d.Accel_X * 0.031;
    d.Accel_Y = +d.Accel_Y * 0.031;
    d.Accel_Z = +d.Accel_Z * 0.031;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.count));
  y.domain([
    d3.min(AV_Data, (d) => d.Accel_X),
    d3.max(AV_Data, (d) => d.Accel_X),
  ]);

  //Create Required Lines for Chart
  var Low_X_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_X));

  var Low_Y_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_Y));

  var Low_Z_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_Z));

  // Create the accel_low_svg element and append it to the chart container

  var accel_low_svg = d3
    .select("#accel_low_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  accel_low_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Accel_X))
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  accel_low_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  accel_low_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Accel_X)).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the accel_low_svg element

  accel_low_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", Low_X_Accel_line);

  accel_low_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 0.5)
    .attr("d", Low_Y_Accel_line);

  accel_low_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 0.5)
    .attr("d", Low_Z_Accel_line);

  // // Add the chart title

  accel_low_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Acceleromter (Low) - (G)");

  // Ledgend
  accel_low_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "steelblue")
    .text("X-Axis");

  accel_low_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 45)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "darkOrange")
    .text("Y-Axis");

  accel_low_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 90)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "red")
    .text("Z-Axis");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// HIGH ACCEL GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/data_highres.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.count = +d.count;
    d.Accel_X = +d.Accel_X * 0.031;
    d.Accel_Y = +d.Accel_Y * 0.031;
    d.Accel_Z = +d.Accel_Z * 0.031;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.count));
  y.domain([
    d3.min(AV_Data, (d) => d.Accel_X),
    d3.max(AV_Data, (d) => d.Accel_X),
  ]);

  //Create Required Lines for Chart

  var High_X_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_X));

  var High_Y_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_Y));

  var High_Z_Accel_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.Accel_Z));

  // Create the accel_high_svg element and append it to the chart container

  var accel_high_svg = d3
    .select("#accel_high_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  accel_high_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Accel_X))
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  accel_high_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  accel_high_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Accel_X)).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the accel_high_svg element

  accel_high_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", High_X_Accel_line);

  accel_high_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 0.5)
    .attr("d", High_Y_Accel_line);

  accel_high_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 0.5)
    .attr("d", High_Z_Accel_line);

  // // Add the chart title

  accel_high_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Acceleromter (High) - (G)");

  // Ledgend
  accel_high_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "steelblue")
    .text("X-Axis");

  accel_high_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 45)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "darkOrange")
    .text("Y-Axis");

  accel_high_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 90)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "red")
    .text("Z-Axis");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// GYRO GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/data_highres.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.count = +d.count;
    d.gyro_x = +d.gyro_x / 13.375;
    d.gyro_y = +d.gyro_y / 13.375;
    d.gyro_z = +d.gyro_z / 13.375;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.count));
  y.domain([
    d3.min(AV_Data, (d) => d.gyro_x),
    d3.max(AV_Data, (d) => d.gyro_x),
  ]);

  //Create Required Lines for Chart

  var gyro_x_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.gyro_x));

  var gyro_y_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.gyro_y));

  var gyro_z_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.gyro_z));

  // Create the gyro_svg element and append it to the chart container

  var gyro_svg = d3
    .select("#gyro_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  gyro_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Accel_X) / 10)
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  gyro_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  gyro_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Accel_X) / 10).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the gyro_svg element

  gyro_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", gyro_x_line);

  gyro_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 0.5)
    .attr("d", gyro_y_line);

  gyro_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 0.5)
    .attr("d", gyro_z_line);

  // // Add the chart title

  gyro_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Gyroscope - (deg/sec)");

  // Ledgend
  gyro_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "steelblue")
    .text("X-Axis");

  gyro_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 45)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "darkOrange")
    .text("Y-Axis");

  gyro_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 90)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "red")
    .text("Z-Axis");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// Mag GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/data_highres.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.count = +d.count;
    d.mag_x = +d.mag_x / 12000;
    d.mag_y = +d.mag_y / 12000;
    d.mag_z = +d.mag_z / 12000;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.count));
  y.domain([d3.min(AV_Data, (d) => d.mag_x), d3.max(AV_Data, (d) => d.mag_x)]);

  //Create Required Lines for Chart

  var mag_x_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.mag_x));

  var mag_y_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.mag_y));

  var mag_z_line = d3
    .line()
    .x((d) => x(d.count))
    .y((d) => y(d.mag_z));

  // Create the mag_svg element and append it to the chart container

  var mag_svg = d3
    .select("#mag_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  mag_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Accel_X) / 10)
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  mag_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  mag_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Accel_X) / 10).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the mag_svg element

  mag_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", mag_x_line);

  mag_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 0.5)
    .attr("d", mag_y_line);

  mag_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 0.5)
    .attr("d", mag_z_line);

  // // Add the chart title

  mag_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Magnetometer - (Gauss)");

  // Ledgend
  mag_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "steelblue")
    .text("X-Axis");

  mag_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 45)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "darkOrange")
    .text("Y-Axis");

  mag_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 90)
    .attr("y", margin.bottom - 7)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "red")
    .text("Z-Axis");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// VELOCITY GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/BR_low_rate.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.Flight_Time = +d.Flight_Time;
    d.Velocity_Up = +d.Velocity_Up;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.Flight_Time));
  y.domain([
    d3.min(AV_Data, (d) => d.Velocity_Up),
    d3.max(AV_Data, (d) => d.Velocity_Up),
  ]);

  //Create Required Lines for Chart

  var velocity_line = d3
    .line()
    .x((d) => x(d.Flight_Time))
    .y((d) => y(d.Velocity_Up));

  // Create the velocity_svg element and append it to the chart container

  var velocity_svg = d3
    .select("#velocity_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  velocity_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 30)
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  velocity_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  velocity_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 30).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the velocity_svg element

  velocity_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", velocity_line);

  // // Add the chart title

  velocity_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Velocity - (m/s)");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// BAROMETER GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/BR_low_rate.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.Flight_Time = +d.Flight_Time;
    d.Baro = +d.Baro_Altitude_AGL;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.Flight_Time));
  y.domain([d3.min(AV_Data, (d) => d.Baro), d3.max(AV_Data, (d) => d.Baro)]);

  //Create Required Lines for Chart

  var velocity_line = d3
    .line()
    .x((d) => x(d.Flight_Time))
    .y((d) => y(d.Baro));

  // Create the baro_svg element and append it to the chart container

  var baro_svg = d3
    .select("#baro_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  baro_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 10)
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  baro_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  baro_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 5).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the baro_svg element

  baro_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("d", velocity_line);

  // // Add the chart title

  baro_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Barometer - (Feet AGL)");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// 3D GRAPH ///////

////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data for Chat

d3.csv("./csv/BR_low_rate.csv").then(function (AV_Data) {
  // Parse the date and convert the population to a number
  //var parseDate = d3.time.format('%H h : %M min : %S sec');
  AV_Data.forEach((d) => {
    d.Flight_Time = +d.Flight_Time;
    d.Velocity_Up = +d.Velocity_Up;
  });

  // Define the x and y domains

  x.domain(d3.extent(AV_Data, (d) => d.Flight_Time));
  y.domain([
    d3.min(AV_Data, (d) => d.Velocity_Up),
    d3.max(AV_Data, (d) => d.Velocity_Up),
  ]);

  //Create Required Lines for Chart

  var velocity_line = d3
    .line()
    .x((d) => x(d.Flight_Time))
    .y((d) => y(d.Velocity_Up));

  // Define Graph varants

  var threeD_margin = { top: 20, right: 0, bottom: 10, left: 40 };
  var threeD_width = 480 - margin.left - margin.right;
  var threeD_height = 500 - margin.top - margin.bottom;

  // Set up the x and y scales

  var threeD_x = d3.scaleTime().range([0, threeD_width]);

  var threeD_y = d3.scaleLinear().range([threeD_height, 0]);

  // Create the threeD_svg element and append it to the chart container

  var threeD_svg = d3
    .select("#threeD_graph")
    .append("svg")
    .attr("width", threeD_width + threeD_margin.left + threeD_margin.right)
    .attr("height", threeD_height + threeD_margin.top + threeD_margin.bottom)
    .append("g")
    .attr("transform", `translate(${threeD_margin.left},${threeD_margin.top})`);

  // Add the y-axis
  threeD_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(threeD_y)
        .ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 30)
        .tickFormat((d) => {
          return `${d.toFixed(0)}`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  threeD_svg
    .selectAll("xGrid")
    .data(threeD_x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => threeD_x(d))
    .attr("x2", (d) => threeD_x(d))
    .attr("y1", 0)
    .attr("y2", threeD_height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  threeD_svg
    .selectAll("yGrid")
    .data(y.ticks(d3.max(AV_Data, (d) => d.Velocity_Up) / 30).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", threeD_width)
    .attr("y1", (d) => threeD_y(d))
    .attr("y2", (d) => threeD_y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the threeD_svg element

  threeD_svg
    .append("path")
    .datum(AV_Data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", velocity_line);

  // // Add the chart title

  threeD_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${threeD_height})`)
    .attr("x", threeD_margin.right)
    .attr("y", threeD_margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Stand In for 3D Graph of Flight Path");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////

// Payload Data Graphs

/////////////////////////////////////////////////////////////////////////////////////////

// // Load and Process AV_Data (currently doing all data)

d3.csv("./csv/jdi_data_daily.csv").then(function (PL_Data) {
  // Parse the date and convert the population to a number
  var parseDate = d3.timeParse("%Y-%m-%d");
  PL_Data.forEach((d) => {
    d.date = parseDate(d.date);
    d.population = +d.population;
  });

  //Set Mean Values of PL Data -- Copy when proper CSV has been implemented, slap in function and set recall interval similar to clock
  document.getElementById("PL-mean-temp-insulated").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  \u00B0 C";
  document.getElementById("PL-mean-temp-uninsualted").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  \u00B0 C";
  document.getElementById("PL-mean-humid-insulated").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  g/kg";
  document.getElementById("PL-mean-humid-uninsulated").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  g/kg";
  document.getElementById("PL-mean-pressure-insulated").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  Pa";
  document.getElementById("PL-mean-pressure-uninsulated").textContent =
    parseFloat(d3.mean(PL_Data, (d) => d.population)).toFixed(2) + "  Pa";

  console.log(PL_Data);

  // Define the x and y domains

  x.domain(d3.extent(PL_Data, (d) => d.date));
  y.domain([65000, d3.max(PL_Data, (d) => d.population)]);

  //////////////////////////////////////////////////////////////////////////////////////////

  //Currently only 1 data set, as such only 1 line object, will need to make some per chart

  var line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.population));

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  // PL Temp Graph

  // Create the pl_temp_svg element and append it to the chart container

  var pl_temp_svg = d3
    .select("#PL_temp_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  pl_temp_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000)
        .tickFormat((d) => {
          return `${(d / 1000).toFixed(0)}k`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  pl_temp_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  pl_temp_svg
    .selectAll("yGrid")
    .data(
      y.ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000).slice(1)
    )
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the pl_temp_svg element

  pl_temp_svg
    .append("path")
    .datum(PL_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("d", line);

  // // Add the chart title

  pl_temp_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 20)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Temperature");

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  // PL Humidity Graph

  // Create the pl_humid_svg element and append it to the chart container

  var pl_humid_svg = d3
    .select("#PL_humid_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  pl_humid_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000)
        .tickFormat((d) => {
          return `${(d / 1000).toFixed(0)}k`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  pl_humid_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  pl_humid_svg
    .selectAll("yGrid")
    .data(
      y.ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000).slice(1)
    )
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the pl_humid_svg element

  pl_humid_svg
    .append("path")
    .datum(PL_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("d", line);

  // // Add the chart title

  pl_humid_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 20)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Humidity");

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  // PL Accel  Graph

  // Create the pl_accel_svg element and append it to the chart container

  var pl_accel_svg = d3
    .select("#PL_accel_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  pl_accel_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000)
        .tickFormat((d) => {
          return `${(d / 1000).toFixed(0)}k`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  pl_accel_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  pl_accel_svg
    .selectAll("yGrid")
    .data(
      y.ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000).slice(1)
    )
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the pl_accel_svg element

  pl_accel_svg
    .append("path")
    .datum(PL_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("d", line);

  // // Add the chart title

  pl_accel_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 20)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Acceleration");

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  // PL Accel  Graph

  // Create the pl_pressure_svg element and append it to the chart container

  var pl_pressure_svg = d3
    .select("#PL_pressure_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add the y-axis
  pl_pressure_svg
    .append("g")
    .style("font-size", "14px")
    .call(
      d3
        .axisLeft(y)
        .ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000)
        .tickFormat((d) => {
          return `${(d / 1000).toFixed(0)}k`;
        })
        .tickSize(0)
        .tickPadding(10)
    )
    .call((g) => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden";
      } else {
        return "visible";
      }
    });

  // Add vertical gridlines
  pl_pressure_svg
    .selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  pl_pressure_svg
    .selectAll("yGrid")
    .data(
      y.ticks((d3.max(PL_Data, (d) => d.population) - 65000) / 5000).slice(1)
    )
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // Add the line path to the pl_pressure_svg element

  pl_pressure_svg
    .append("path")
    .datum(PL_Data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("d", line);

  // // Add the chart title

  pl_pressure_svg
    .append("text")
    .attr("class", "chart-title")
    .attr("transform", `translate(0,${height})`)
    .attr("x", margin.right + 20)
    .attr("y", margin.bottom - 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("fill", "#777")
    .text("Pressure");

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
});

//////////////////////////////////////////////////////////////////////////////////////////

function UpdateAVGraphs() {}

////////////////////////////////////////////////////////////////////////////////////////////////////////

getMaxAltitude();

//Set Time Originally
updateTime();

AVGraphs();

//Update Time every 10 seconds
setInterval(updateTime, 10000);
setInterval(getMaxAltitude, 1000);

//setInterval(AVGraphs, 1000);

  // Initial Chart Configuration
  const margin = { top: 50, right: 50, bottom: 70, left: 80 },
    svgWidth = 660,
    svgHeight = 470,
    chartWidth = svgWidth - margin.left - margin.right,
    chartHeight = svgHeight - margin.top - margin.bottom,
    svg = d3
      .select("#stackApp")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

  let chartGroup = svg
      .append("g")
      .attr("id", "chartGroup")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

  var tooltip = d3
    .select("#stackApp")
    .append("div")
    .classed("tooltip", true)
    .style("visibility", "hidden");

    
d3.json("stack_data.json").then(function (data) {
  // Extract data from query
  console.log("loading data...")
  var playerData = data["players"],
    teams = data["teams"];
    // console.log(playerData)
    // console.log(teams)
  var positions = ["qb", "rb", "wr", "te", "dst", "flex"],
    qbs = playerData.filter((row) => row.position === "QB"),
    rbs = playerData.filter((row) => row.position === "RB"),
    wrs = playerData.filter((row) => row.position === "WR"),
    tes = playerData.filter((row) => row.position === "TE"),
    dst = playerData.filter((row) => row.position === "DEF");

  assignOptions(qbs, "qb");
  assignOptions(rbs, "rb");
  assignOptions(wrs, "wr");
  assignOptions(tes, "te");
  assignOptions(dst, "dst");
  assignOptions(["RB", "WR", "TE"], "flexPosition");

  //  initiate empty dictionaries to be used for data
  // manipulation later in code
  var counts = {
      qbCount: 0,
      rbCount: 0,
      wrCount: 0,
      teCount: 0,
      dstCount: 0,
      flexCount: 0,
    },
    currentTeam = {
      teamName: [],
      QBs: { players: [], projs: [], prices: [] },
      RBs: { players: [], projs: [], prices: [] },
      WRs: { players: [], projs: [], prices: [] },
      TEs: { players: [], projs: [], prices: [] },
      DSTs: { players: [], projs: [], prices: [] },
      flexs: { players: [], projs: [], prices: [] },
    };

  // Get team data
  var teamLists = teams.map((elem) => {
    var nameList = Object.values(elem).flat(1);
    (price = getTeamData(playerData, nameList, "salary")),
      (projection = getTeamData(playerData, nameList, "C_Proj")),
      (teamName = nameList.shift());
    nameList.unshift(Math.round((price / projection) * 100) / 100);
    nameList.unshift(Math.round(price * 100) / 100);
    nameList.unshift(Math.round(projection * 100) / 100);
    nameList.unshift(teamName);
    return nameList;
  });

  
  //   Bind team data too the table in the DOM
  var teamsData = teamLists.map((row) => [row[0], row[2], row[1]]);
  teamNames4buttons = teamsData.map((row) => {
    return row[0];
  });
  var table = d3.select("#tableBody");
  var trow = table.selectAll("tr").data(teamLists).enter().append("tr");
  var td = trow
    .selectAll("td")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("td")
    .text(function (d) {
      return d;
    });

  //  long svg are the trash can in eevry row
  var td2 = trow
    .append("a")
    .attr("href", (d) => {
      return `/delete/teams/${d[0]}`;
    })
    .append("button")
    .classed("btn btn-danger", true)
    .append("svg")
    .attr("viewBox", "0 0 24 24")
    .attr("width", "16")
    .attr("height", "16");
  td2
    .append("path")
    .attr("fill-rule", "evenodd")
    .attr(
      "d",
      "M16 1.75V3h5.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H8V1.75C8 .784 8.784 0 9.75 0h4.5C15.216 0 16 .784 16 1.75zm-6.5 0a.25.25 0 01.25-.25h4.5a.25.25 0 01.25.25V3h-5V1.75z"
    );
  td2
    .append("path")
    .attr(
      "d",
      "M4.997 6.178a.75.75 0 10-1.493.144L4.916 20.92a1.75 1.75 0 001.742 1.58h10.684a1.75 1.75 0 001.742-1.581l1.413-14.597a.75.75 0 00-1.494-.144l-1.412 14.596a.25.25 0 01-.249.226H6.658a.25.25 0 01-.249-.226L4.997 6.178z"
    );
  td2
    .append("path")
    .attr(
      "d",
      "M9.206 7.501a.75.75 0 01.793.705l.5 8.5A.75.75 0 119 16.794l-.5-8.5a.75.75 0 01.705-.793zm6.293.793A.75.75 0 1014 8.206l-.5 8.5a.75.75 0 001.498.088l.5-8.5z"
    );

    xLinearScale = xScale(
      teamsData.map((row) => {
        return row[1];
      }),
      chartWidth
    ),
    yLinearScale = yScale(
      teamsData.map((row) => {
        return row[2];
      }),
      chartHeight
    ),
    bottomAxis = d3.axisBottom(xLinearScale),
    leftAxis = d3.axisLeft(yLinearScale),
    xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis),
    yAxis = chartGroup
      .append("g")
      .classed("y-axis", true)
      .classed("transform", `translate(${chartWidth}, 0)`)
      .call(leftAxis);

  // Append axis labels
  let xlabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Price")
    .classed("active", true)
    .text("Price");

  let ylabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate( ${chartHeight / 2}, ${0 - margin.left})`)
    .attr("transform", "rotate(-90)");

  ylabelsGroup
    .append("text")
    .attr("x", -(chartHeight / 2) - 80)
    .attr("y", -margin.left + 45)
    .attr("value", "Projection")
    .classed("active", true)
    .text("Consensus Projection (sum)");

  // Append labels for different plot on top of
  // the graph with their own group
  let dataLabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate( ${0 + margin.top}, ${0.5 * svgWidth})`);

  dataLabelsGroup
    .append("text")
    .attr("x", -25)
    .attr("y", -340)
    .attr("value", "teamBuild")
    .classed("active", false)
    .text("Builder");
  dataLabelsGroup
    .append("text")
    .attr("x", 135)
    .attr("y", -340)
    .attr("value", "teamPlayers")
    .classed("active", false)
    .text("Teams: Players");
  dataLabelsGroup
    .append("text")
    .attr("x", 295)
    .attr("y", -340)
    .attr("value", "teamStacked")
    .classed("active", true)
    .text("Teams: Stacked");

  circleColors = [
    "#9B5DE5",
    "#f15bb5",
    "#fee440",
    "#c1839f",
    "#00bbf9",
    "#00f5d4",
    "#ff5a5f",
    "#087e8b",
  ];
  var yCurrentSelection = "Projection",
    dataCurrentSelection = "teamStacked",
    teamCircleColor = d3
      .scaleOrdinal()
      .domain(
        teamsData.map((row) => {
          return row[0];
        })
      )
      .range(circleColors);

  // Graph the data
  let circlesGroup = chartGroup.append("g").attr("id", "circleGroup");
  circlesGroup
    .selectAll("circle") //change to circle?
    .data(teamsData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xLinearScale(parseFloat(d[1])))
    .attr("cy", (d) => yLinearScale(parseFloat(d[2])))
    .attr("r", 5)
    .style("fill", (d) => teamCircleColor(d[0]))
    .style("opacity", 0.8)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`${d[0]} <br/> ${d[2]}`)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .style("visibility", "visible");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    });

  // Event handler for switching
  dataLabelsGroup.selectAll("text").on("click", function () {
    let tag = d3.select(this),
      activeLabel = dataLabelsGroup.select(".active"),
      tagValue = tag.attr("value");
    if (tagValue != dataCurrentSelection) {
      newTag = tag.classed("active", true);
      activeLabel.classed("active", false);
      dataCurrentSelection = newTag.attr("value");

      if (dataCurrentSelection == "teamStacked") {
        xLinearScale = xScale(
          teamsData.map((row) => {
            return row[1];
          }),
          chartWidth
        );
        yLinearScale = yScale(
          teamsData.map((row) => {
            return row[2];
          }),
          chartHeight
        );
        xAxis = renderXAxis(xLinearScale, xAxis);
        yAxis = renderYAxis(yLinearScale, yAxis);
        circlesGroup = renderCircles(
          xLinearScale,
          yLinearScale,
          yCurrentSelection,
          teamsData,
          dataCurrentSelection,
          tooltip
        );
      } else if (dataCurrentSelection == "teamPlayers") {
        allTeamPlayers = teams
          .map((elem) => {
            var nameList = Object.values(elem).flat(1);
            teamPlayers = getTeamData(playerData, nameList, "players");
            return teamPlayers;
          })
          .flat(1);
        xLinearScale = xScale(
          allTeamPlayers.map((obj) => obj["salary"]),
          chartWidth
        );
        yLinearScale = yScale(
          [
            allTeamPlayers.map((obj) => obj["C_Floor"]),
            allTeamPlayers.map((obj) => obj["C_Proj"]),
            allTeamPlayers.map((obj) => obj["C_Ceil"]),
          ].flat(1),
          chartHeight
        );
        xAxis = renderXAxis(xLinearScale, xAxis);
        yAxis = renderYAxis(yLinearScale, yAxis);
        circlesGroup = renderCircles(
          xLinearScale,
          yLinearScale,
          yCurrentSelection,
          allTeamPlayers,
          dataCurrentSelection,
          tooltip
        );
      } else if (dataCurrentSelection == "teamBuild") {
        plotCurrentTeam(
          currentTeam,
          chartWidth,
          chartHeight,
          xAxis,
          yAxis,
          dataCurrentSelection,
          yCurrentSelection,
          tooltip
        );
      }
    }
  });

  //   Bind the currently selected team to the DOM
  d3.select("#currentTeam")
    .selectAll("ul")
    .data(positions)
    .enter()
    .append("div")
    .append("ul")
    .classed("list-group", true)
    .classed("positionList", true)
    .attr("id", function (d) {
      return `${d}List`;
    });

  // // Event handler for player selection
  // d3.selectAll(".qbOpt").on("click", function () {
  //   if (counts["qbCount"] < 1) {
  //     // Define vars and add to count lists
  //     var proj = d3.select(this).attr("proj"),
  //       price = d3.select(this).attr("price"),
  //       list = d3.select("#qbList");

  //     currentTeam.QBs.players.push(this.value);
  //     currentTeam.QBs.projs.push(proj);
  //     currentTeam.QBs.prices.push(price);

  //     addPlayerTag(list, currentTeam.QBs.players);
  //     counts["qbCount"]++;
  //     updateRemoveButtonFunction(
  //       counts,
  //       currentTeam,
  //       chartWidth,
  //       chartHeight,
  //       xAxis,
  //       yAxis,
  //       dataCurrentSelection,
  //       yCurrentSelection
  //     );
  //     if (dataCurrentSelection == "teamBuild") {
  //       plotCurrentTeam(
  //         currentTeam,
  //         chartWidth,
  //         chartHeight,
  //         xAxis,
  //         yAxis,
  //         dataCurrentSelection,
  //         yCurrentSelection,
  //         tooltip
  //       );
  //     }
  //   }
  // });


  // d3.selectAll(".dstOpt").on("click", function () {
  //   if (counts["dstCount"] < 1) {
  //     // Define vars and add to count lists
  //     var proj = d3.select(this).attr("proj"),
  //       price = d3.select(this).attr("price"),
  //       list = d3.select("#dstList");

  //     currentTeam.DSTs.players.push(this.value);
  //     currentTeam.DSTs.projs.push(proj);
  //     currentTeam.DSTs.prices.push(price);

  //     // Manipulate DOM
  //     addPlayerTag(list, currentTeam.DSTs.players);
  //     counts["dstCount"]++;
  //     updateRemoveButtonFunction(
  //       counts,
  //       currentTeam,
  //       chartWidth,
  //       chartHeight,
  //       xAxis,
  //       yAxis,
  //       dataCurrentSelection,
  //       yCurrentSelection
  //     );
  //     if (dataCurrentSelection == "teamBuild") {
  //       plotCurrentTeam(
  //         currentTeam,
  //         chartWidth,
  //         chartHeight,
  //         xAxis,
  //         yAxis,
  //         dataCurrentSelection,
  //         yCurrentSelection,
  //         tooltip
  //       );
  //     }
  //   }
  // });

  // //   Event handler for flex position
  // d3.selectAll(".flexPositionOpt").on("click", function () {
  //   if (this.value == "RB") {
  //     assignOptions(rbs, "flexPlayer");
  //     updateFlexOptions(
  //       counts,
  //       currentTeam,
  //       chartWidth,
  //       chartHeight,
  //       xAxis,
  //       yAxis,
  //       dataCurrentSelection,
  //       yCurrentSelection,
  //       tooltip
  //     );
  //   } else if (this.value == "WR") {
  //     assignOptions(wrs, "flexPlayer");
  //     updateFlexOptions(
  //       counts,
  //       currentTeam,
  //       chartWidth,
  //       chartHeight,
  //       xAxis,
  //       yAxis,
  //       dataCurrentSelection,
  //       yCurrentSelection,
  //       tooltip
  //     );
  //   } else if (this.value == "TE") {
  //     assignOptions(tes, "flexPlayer");
  //     updateFlexOptions(
  //       counts,
  //       currentTeam,
  //       chartWidth,
  //       chartHeight,
  //       xAxis,
  //       yAxis,
  //       dataCurrentSelection,
  //       yCurrentSelection,
  //       tooltip
  //     );
  //   }
  // });

  //  event handler for team name submition
  d3.select("#nameSetterButton").on("click", function () {
    var input = d3.select(this.parentNode.parentNode).select("#nameSetter");
    while (currentTeam.teamName.length) {
      currentTeam.teamName.pop();
    }
    currentTeam.teamName.push(input.node().value);
  });

  //   event handler for team submition
  d3.select("#submitButton").on("click", function () {
    if (currentTeam.teamName[0] == undefined || currentTeam.teamName[0] == "") {
      teamName = "default";
    } else if (
      currentTeam.teamName[0] != undefined &&
      currentTeam.teamName[0] != ""
    ) {
      teamName = currentTeam.teamName[0];
    }
    if (currentTeam.QBs.players[0] != undefined) {
      qb = currentTeam.QBs.players[0];
    } else if (currentTeam.QBs.players[0] == undefined) {
      qb = "nan";
    }
    if (currentTeam.RBs.players[0] != undefined) {
      rb1 = currentTeam.RBs.players[0];
    } else if (currentTeam.RBs.players[0] == undefined) {
      rb1 = "nan";
    }
    if (currentTeam.RBs.players[1] != undefined) {
      rb2 = currentTeam.RBs.players[1];
    } else if (currentTeam.RBs.players[1] == undefined) {
      rb2 = "nan";
    }
    if (currentTeam.WRs.players[0] != undefined) {
      wr1 = currentTeam.WRs.players[0];
    } else if (currentTeam.WRs.players[0] == undefined) {
      wr1 = "nan";
    }
    if (currentTeam.WRs.players[1] != undefined) {
      wr2 = currentTeam.WRs.players[1];
    } else if (currentTeam.WRs.players[1] == undefined) {
      wr2 = "nan";
    }
    if (currentTeam.WRs.players[2] != undefined) {
      wr3 = currentTeam.WRs.players[2];
    } else if (currentTeam.WRs.players[2] == undefined) {
      wr3 = "nan";
    }
    if (currentTeam.TEs.players[0] != undefined) {
      te = currentTeam.TEs.players[0];
    } else if (currentTeam.TEs.players[0] == undefined) {
      te = "nan";
    }
    if (currentTeam.DSTs.players[0] != undefined) {
      dst = currentTeam.DSTs.players[0];
    } else if (currentTeam.DSTs.players[0] == undefined) {
      dst = "nan";
    }
    if (currentTeam.flexs.players[0] != undefined) {
      flex = currentTeam.flexs.players[0];
    } else if (currentTeam.flexs.players[0] == undefined) {
      flex = "nan";
    }

    // add player to file and refresh page to reflect changes
    var teamPlayers = [teamName, qb, rb1, rb2, wr1, wr2, wr3, te, dst, flex];
    addTeamToFile(teamPlayers);
    window.location.reload();
  });
});

// d3.selectAll(".rbOpt").on("click", function () {
//   if (counts["rbCount"] < 2) {
//     // Define vars and add to count lists
//     var proj = d3.select(this).attr("proj"),
//       price = d3.select(this).attr("price"),
//       list = d3.select("#rbList");

//     currentTeam.RBs.players.push(this.value);
//     currentTeam.RBs.projs.push(proj);
//     currentTeam.RBs.prices.push(price);

//     // Manipulate DOM
//     addPlayerTag(list, currentTeam.RBs.players);
//     counts["rbCount"]++;
//     updateRemoveButtonFunction(
//       counts,
//       currentTeam,
//       chartWidth,
//       chartHeight,
//       xAxis,
//       yAxis,
//       dataCurrentSelection,
//       yCurrentSelection
//     );
//     if (dataCurrentSelection == "teamBuild") {
//       plotCurrentTeam(
//         currentTeam,
//         chartWidth,
//         chartHeight,
//         xAxis,
//         yAxis,
//         dataCurrentSelection,
//         yCurrentSelection,
//         tooltip
//       );
//     }
//   }
// });

// d3.selectAll(".wrOpt").on("click", function () {
//   console.log("hellowr")
//   if (counts["wrCount"] < 3) {
//     // Define vars and add to count lists
//     var proj = d3.select(this).attr("proj"),
//       price = d3.select(this).attr("price"),
//       list = d3.select("#wrList");

//     currentTeam.WRs.players.push(this.value);
//     currentTeam.WRs.projs.push(proj);
//     currentTeam.WRs.prices.push(price);

//     // Manipulate DOM
//     addPlayerTag(list, currentTeam.WRs.players);
//     counts["wrCount"]++;
//     updateRemoveButtonFunction(
//       counts,
//       currentTeam,
//       chartWidth,
//       chartHeight,
//       xAxis,
//       yAxis,
//       dataCurrentSelection,
//       yCurrentSelection
//     );

//     if (dataCurrentSelection == "teamBuild") {
//       plotCurrentTeam(
//         currentTeam,
//         chartWidth,
//         chartHeight,
//         xAxis,
//         yAxis,
//         dataCurrentSelection,
//         yCurrentSelection,
//         tooltip
//       );
//     }
//   }
// });

// d3.selectAll(".teOpt").on("click", function () {
//   console.log("hello")
//   if (counts["teCount"] < 1) {
//     // Define vars and add to count lists
//     var proj = d3.select(this).attr("proj"),
//       price = d3.select(this).attr("price"),
//       list = d3.select("#teList");

//     currentTeam.TEs.players.push(this.value);
//     currentTeam.TEs.projs.push(proj);
//     currentTeam.TEs.prices.push(price);

//     // Manipulate DOM
//     addPlayerTag(list, currentTeam.TEs.players);
//     counts["teCount"]++;
//     updateRemoveButtonFunction(
//       counts,
//       currentTeam,
//       chartWidth,
//       chartHeight,
//       xAxis,
//       yAxis,
//       dataCurrentSelection,
//       yCurrentSelection
//     );
//     if (dataCurrentSelection == "teamBuild") {
//       plotCurrentTeam(
//         currentTeam,
//         chartWidth,
//         chartHeight,
//         xAxis,
//         yAxis,
//         dataCurrentSelection,
//         yCurrentSelection,
//         tooltip
//       );
//     }
//   }
// });

d3.selectAll('.posSelect').on('change', function() {
  // Get the selected players from the dropdowns
  var selectedQB = d3.select('#qbSelection').node().value;
  var selectedRB = d3.select('#rbSelection').node().value;
  var selectedWR = d3.select('#wrSelection').node().value;
  var selectedTE = d3.select('#teSelection').node().value;
  var selectedDST = d3.select('#dstSelection').node().value;
  var selectedFlexPosition = d3.select('#flexPositionSelection').node().value;
  var selectedFlexPlayer = d3.select('#flexPlayerSelection').node().value;

  // Update the current team display
  var team = {
    QB: selectedQB,
    RB: [selectedRB],
    WR: [selectedWR],
    TE: selectedTE,
    DST: selectedDST,
    Flex: {
      position: selectedFlexPosition,
      player: selectedFlexPlayer
    }
  };

  // Plot the current team
  plotCurrentTeam(team, 
    chartWidth,
            chartHeight,
            xAxis,
            yAxis,
            "builder",
            yCurrentSelection,
            tooltip);
});
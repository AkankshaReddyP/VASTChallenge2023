// Network data code

// import React, { useContext } from "react";
import React, {useContext, useEffect, useRef, useState} from "react";
import NetworkDataJson from "../../data/MC1.json";
import { Data } from "../../Context";
import * as d3 from "d3";



const SocialNetwork = () => {
    
    // console.clear();
    // console.log('Social Network called ');
   function handleCircleClick(circleElement, entityid) {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    // Reset all circles to normal state
    NewCircles.attr("opacity", 0.69)
        .attr("fill", d => {
            if (d.experience >= 18 && d.experience <= 30) {
                return colorScale("18-30");
            } else if (d.experience > 30 && d.experience <= 45) {
                return colorScale("30-45");
            } else if (d.experience > 45 && d.experience <= 60) {
                return colorScale("45-60");
            } else {
                return "black"; 
            }
        });

    // Highlight the clicked circle
    d3.select(circleElement)
        .attr("opacity", 1)
        .attr("fill", "green");

    setParticipantsID(entityid);
}

    // const NewCirclesRef = useRef();

    // ... (where you define NewCircles)
    var NetworkData;
    var Networkwidth;
    var Networkheight;
    var radiusScale;
    var tick;
    const [hasSimulationRun, setHasSimulationRun] = useState(false);

    const NewCirclesRef = useRef();
        const ref = useRef();
        const {participantsData,participantsID,setParticipantsID} = useContext(Data);
        // console.log('Data received from Parallel is  ',participantsID);
        const [prevParticipantsID, setPrevParticipantsID] = useState(null);
        const [clickedCircle, setClickedCircle] = useState(null);
        var externalClick = false;
useEffect(() => {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    if (!hasSimulationRun) {
        var simulation = d3.forceSimulation(NetworkData)
            .force("center", d3.forceCenter(Networkwidth / 2, Networkheight / 2))
            .force("x", d3.forceX(Networkwidth / 2).strength(0.1))
            .force("y", d3.forceY(Networkheight / 2).strength(0.1))
            .force("collide", d3.forceCollide(d => radiusScale(d.revenue))) 
            .alphaDecay(0.1)
            .alpha(0.03)
            .on("tick", tick);

        let init_decay = setTimeout(function() {
            console.log('Simuation is called');
            simulation.alphaDecay(0.1);
        }, 3000);

        setHasSimulationRun(true);
    }



    if (participantsID && NewCirclesRef.current) {
        // If there was a previously selected participant, trigger 'mouseout' on their circle
        if (prevParticipantsID) {
            const prevCircleElement = NewCirclesRef.current.filter(d => d.entityid === prevParticipantsID).node();
            if (prevCircleElement) {
                externalClick = true;
                prevCircleElement.dispatchEvent(new Event('mouseout'));
            }
        }

        // Trigger 'click' on the newly selected participant's circle
        const circleElement = NewCirclesRef.current.filter(d => d.entityid === participantsID).node();
        if (circleElement) {

            circleElement.dispatchEvent(new Event('click'));
        }

        // Update prevParticipantsID
        setPrevParticipantsID(participantsID);
    }
}, [participantsID, NewCirclesRef.current, prevParticipantsID]);








var NewCircles;
// ... (where you define NewCircles)


useEffect(() => {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    console.log('Called');
    if (participantsID && NewCirclesRef.current) {
        const circle = NewCirclesRef.current.filter(d => d.entityid === participantsID).node();
        if (circle) {
            circle.dispatchEvent(new Event('click'));
        }
    }
}, [participantsID, NewCirclesRef.current]);
    
    
    
    useEffect(() => {
        const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
        console.log(' Now called here ');
    
        // console.clear();

        
var NetworkData = Object.values(participantsData)
// .slice(0, 100)
;
NetworkData.sort((a, b) => b.experience - a.experience || b.profit_percent - a.profit_percent);

function Close_entities(d) {
    // console.log('network data for checking is ',NetworkData);
    let profit_percentDifferences = NetworkData.map(node => ({
        node: node,
        difference: Math.abs(d.profit_percent - node.profit_percent)
    }));

    profit_percentDifferences.sort((a, b) => a.difference - b.difference);

    // Select top 5 nodes
    let closestNodes = profit_percentDifferences.slice(1, 6).map(item => item.node); // Exclude the first node because it's the hovered node itself
    // console.log('Closest 5 nodes are: ', closestNodes);
    return closestNodes;
}
// ...
// var NetworkData = Object.values(NetworkDataJson)
// .slice(0, 100)
// ;
// NetworkData.sort((a, b) => b.experience - a.experience || b.profit_percent - a.profit_percent);

let topParticipants = [];
let experienceGroups = [...new Set(NetworkData.map(item => item.experience))];

experienceGroups.forEach(experience => {
    let participants = NetworkData.filter(item => item.experience === experience);
    participants.sort((a, b) => b.profit_percent - a.profit_percent);
    for(let i = 0; i < 5 && i < participants.length; i++) {
        topParticipants.push(participants[i]);
    }
});
function calculateprofit_percentDifference(node1, node2) {
    return Math.abs(node1.profit_percent - node2.profit_percent);
}

function handleMouseClick(event, d) {
    // Reset all circles to normal state
    NewCircles.attr("opacity", 0.69)
        .attr("fill", d => {
            if (d.experience >= 18 && d.experience <= 30) {
                return colorScale("18-30");
            } else if (d.experience > 30 && d.experience <= 45) {
                return colorScale("30-45");
            } else if (d.experience > 45 && d.experience <= 60) {
                return colorScale("45-60");
            } else {
                return "black"; 
            }
        });

    // If the clicked circle is already highlighted, unhighlight it
    if (highlighted.includes(event.currentTarget)) {
        const index = highlighted.indexOf(event.currentTarget);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(event.currentTarget).attr("opacity", 0.69);
    } else {
        // Unhighlight all circles
        highlighted.forEach(circle => {
            d3.select(circle).attr("opacity", 0.1);
        });
        // Clear the highlighted array
        highlighted = [];
        // Highlight the clicked circle
        highlighted.push(event.currentTarget);
        d3.select(event.currentTarget).attr("opacity", 1).attr("fill", "green");
    }
    tooltip.html(`
<b>Type:</b> ${d.type}
`)
.style("left", (event.pexperienceX) + "px")
.style("top", (event.pexperienceY - 28) + "px");
    setParticipantsID(d.entityid);
}
function internalClick(event, d) {
    simulation.stop();
    setParticipantsID(d.entityid);
    console.log('Called because of ',participantsID);
    if (highlighted.includes(this)) {
        const index = highlighted.indexOf(this);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(this).attr("opacity", 0.69);
    } else {
        highlighted.forEach(circle => {
            d3.select(circle)
                .attr("opacity", 0.1);
        });
        highlighted = [];
        highlighted.push(this);
        d3.select(this).attr("opacity", 0.69);
    }
    handleMouseEvent(event, d);
}


function handleMouseEvent(event,d)
{
    // simulation.stop();
    // console.log('network data on line 57 ',NetworkData);
//     tooltip
//     .style("opacity",0.69)
// .html(<b>Participant ID:</b> ${d.entityid}<br><b>experience:</b> ${d.experience}<br><b>Interest Group:</b> ${d.interestGroup})

    // .style("left", (d3.pointer(event)[0]+leftvar) + "px")
    // .style("top", (d3.pointer(event)[1] + 900) + "px");

    NewCircles.attr("opacity", 0.1);    

let profit_percentDifferences = NetworkData.map(node => ({
node: node,
difference: calculateprofit_percentDifference(d, node)
}));



profit_percentDifferences.sort((a, b) => a.difference - b.difference);
d3.select(this).attr("opacity", 0.69);

let closestNodes = profit_percentDifferences.slice(1, 6).map(item => item.node); 


closestNodes.forEach(closestNode => {
    NewCircles.filter(node => node === closestNode).attr("opacity", 0.69);
});

closestNodes.forEach(closestNode => {
NetworkSVG.append("line")
.attr("x1", d.x+400)
.attr("y1", d.y+450)
.attr("x2", closestNode.x+400)
.attr("y2", closestNode.y+450)
.attr("stroke", "black")
.attr("opacity",.69);
});
tooltip.html(`
<b>Type:</b> ${d.type}
`)
.style("left", (event.pexperienceX) + "px")
.style("top", (event.pexperienceY - 28) + "px");
}


        var NetworkSVG = d3.select(".network-svg");
        Networkwidth = +NetworkSVG.attr("width");
        Networkheight = +NetworkSVG.attr("height");
        
        var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "100px")
        .style("height", "40px")
        .style("padding", "2px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none");
    
    // Create line

    var leftvar = 300;
 
    var minrevenue = d3.min(NetworkData, d => d.revenue);
    var maxrevenue = d3.max(NetworkData, d => d.revenue);

    NetworkSVG.selectAll("rect").remove();
    NetworkSVG.selectAll("text").remove();


    var legend = NetworkSVG
      .append("g")
      .classed("legend", true)
      .attr("transform", "translate(10,10)");

    

    legend.append("rect")
    .attr("x", 0)
    .attr("y", 20) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("45-60"))
    .style("stroke","black")
    .style("opacity",0.69)
    ;

legend.append("text")
    .attr("x", 20)
    .attr("y", 30) 
    .style("font-size", 11)
    .text("Type: Person");


    legend.append("rect")
    .attr("x", 0)
    .attr("y", 40) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("30-45"))
    .style("stroke","black")
    .style("opacity",0.69);

legend.append("text")
.attr("x", 20)
.attr("y", 50) 
.style("font-size", 11)
    .text("Type: Company");

    legend.append("rect")
    .attr("x", 0)
    .attr("y", 60) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("18-30"))
    .style("stroke","black")
    .style("opacity",0.69);

legend.append("text")
.attr("x", 20)
.attr("y", 70) 
.style("font-size", 11)
    .text("Type: Vessel");


    radiusScale = d3.scaleLinear()
    .domain([minrevenue, maxrevenue])
    .range([3, 8]);
// Here to 


let highlighted = [];

const toggleHighlight = function(event, d){

    if (highlighted.includes(this)) {
        const index = highlighted.indexOf(this);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(this)
            .transition().duration(200)
            .style("fill", function(d) {
                if (d.experience >= 18 && d.experience <= 30) {
                    return colorScale("18-30");
                } else if (d.experience > 30 && d.experience <= 45) {
                    return colorScale("30-45");
                } else if (d.experience > 45 && d.experience <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            })
            .style("opacity", "0.69");

        let closestNodes = Close_entities(d);
        closestNodes.forEach(closestNode => {
            NewCircles.filter(node => node === closestNode).style("fill", function(d) {
                if (d.experience >= 18 && d.experience <= 30) {
                    return colorScale("18-30");
                } else if (d.experience > 30 && d.experience <= 45) {
                    return colorScale("30-45");
                } else if (d.experience > 45 && d.experience <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            })
            .style("opacity", "0.69");
        });
    } else {

        highlighted.push(this);
        d3.select(this)
            .transition().duration(200)
            .style("fill", "green")
            .style("opacity", "1");


        // console.log('Value of most recent data2 is ',NetworkData)
        let closestNodes = Close_entities(d);
        closestNodes.forEach(closestNode => {
            NewCircles.filter(node => node === closestNode).style("fill", "green").style("opacity", "1");
        });
    }
}

// console.log('Data being fed to network graph is ',NetworkData);

    NewCircles = NetworkSVG.selectAll("circle")
    .data(NetworkData, d => d.entityid)
    .join(
        enter => enter.append("circle")
            .each(d => d.isNew = true)
            // .attr("r",d=>0)
            // .attr("r",  d => radiusScale(d.revenue)) 
            .attr("fill",
            
            d => {
                if (d.experience >= 18 && d.experience <= 30) {
                    return colorScale("18-30");
                } else if (d.experience > 30 && d.experience <= 45) {
                    return colorScale("30-45");
                } else if (d.experience > 45 && d.experience <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            }
            )
            .attr("opacity",0.69)
            .attr("stroke", "black")
                ,
        update => update
        .on("mouseover", function(event, d) {

            // console.log('Network data being sent on 268 is ',NetworkData); 
            handleMouseEvent(event,d);
            d3.select(this).attr("opacity", 0.69);
            })
            .on("mousemove", function(event, d) { 
                handleMouseEvent(event,d);
                        d3.select(this).attr("opacity", 0.69);
              })
              .on("click", internalClick) 
            .on("mouseout", function(d) { 


                if (!highlighted.includes(this)) {
                  NewCircles.attr("opacity", .69);
                    NetworkSVG.selectAll("line").remove();
                }
            })
        .each(d => d.isNew = false)
        ,
        exit => exit.remove()
    );
    NewCirclesRef.current = NewCircles;
    var simulation = d3.forceSimulation(NetworkData)
    .force("collide", d3.forceCollide(d => radiusScale(d.revenue))) 
    .alphaDecay(0.5)
    .alpha(0.03)
    .on("tick", tick);


function tick() {
    NewCircles
    .attr("cx", d => {
        // Only update position if the circle is new
        if (d.isNew) {
            d.x = Math.max(radiusScale(d.revenue), Math.min(Networkwidth - radiusScale(d.revenue), d.x));
        }
        return d.x;
    })
    .attr("cy", d => {
        // Only update position if the circle is new
        if (d.isNew) {
            d.y = Math.max(radiusScale(d.revenue), Math.min(Networkheight - radiusScale(d.revenue), d.y));
        }
        return d.y;
    })
    // .attr("r",0)
    // .transition()
    // .duration(1000)
    .attr("r",  d => radiusScale(d.revenue)) 
    .attr("cx", d => d.x+400)
    .attr("cy", d => d.y+450);
}
let init_decay = setTimeout(function() {
    simulation.alphaDecay(0.1);
}, 3000);
},[hasSimulationRun, participantsID, NewCirclesRef.current, prevParticipantsID,participantsData]);

    return (
        <div>
            {/* Social Network Chart */}
            {/* con */}

            <svg className="network-svg" ref={ref} width="750" height="800"></svg>
        </div>
    )
}

export default SocialNetwork;
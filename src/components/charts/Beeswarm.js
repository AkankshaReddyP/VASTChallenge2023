import React, { useEffect, useContext, useMemo } from "react";
import * as d3 from "d3";

import "./Beeswarm.css";
import { Data } from "../../Context";
// import jobsJson from "../../data/MC2.json";

const animationDuration = 1000;

let dataJobs = null;
let dataEmployers = null;
let chartBusy = false;
let spiderid_SetterFunc = null;
let selectednodeid = -1;

const beeswarm = {
    chartOffsetX: 50,
    chartOffsetY: 0,
    chartWidth: 1100,
    chartHeight: 400,
    chartXLabelOffsetY: 50,
    tooltipOffsetX: -5,
    tooltipOffsetY: -5,
    circleMinRadius: 8,
    circleMaxRadius: 27,
    circleColorOffTheClock: '#316688', //'#594328', // OR #316688
    circleColorOnTheClock: '#91FFA0',//'#F7F54E', // OR #91FFA0
    circleColorHover: '#FF0000',
    circleColorClick: '#2a4e97',
    lineColortimestamp_1: '#00FFFF',

    svg: null,
    chart: null,
    xScale: null,
    xAxis: null,
    xLabel: null,
    rScale: null,
    tooltip: null,
};

const beeswarmFocus = {
    chartOffsetX: 25,
    chartOffsetY: 25,
    chartWidth: 200,
    chartHeight: 200,
    hourTickLength: 10,
    hourTickWidth: 3,
    minuteTickLength: 7,
    minuteTickWidth: 1,
    hourLabelGap: 20,
    centreDotRadius: 5,
    hourHandGap: 35,
    hourHandWidth: 5,
    detailDefaultHtml: 'Hover over a bubble<br/>to see its details.<br/><br/>Click on a bubble to<br/>see entity details.',

    chart: null,
    clockRadius: null,
    startHourHand: null,
    startHourHandLabel: null,
    endHourHandLabel: null,
};

function partition_data(dataArray, key) {
    let groups = dataArray.reduce((acc, obj) => {
        if (!acc[obj[key]]) acc[obj[key]] = [];
        acc[obj[key]].push(obj);
        return acc;
    }, {});

    return Object.values(groups);
}

function tstdecimal(timeString) {
    const parts = timeString.split(' ');
    const amOrPm = parts[1].toLowerCase();
    const timeParts = parts[0].split(':');

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    let time = hours + minutes / 60 + seconds / 3600;

    if (amOrPm === 'pm' && hours !== 12) {
        time += 12;
    }
    if (amOrPm === 'am' && hours === 12) {
        time -= 12;
    }

    return time;
}

function timestr(timeDecimal, roundMinutes = true) {
    let hours = Math.floor(timeDecimal);
    let minutes = Math.floor((timeDecimal - hours) * 60);
    let seconds = Math.floor(((timeDecimal - hours) * 60 - minutes) * 60);

    if (roundMinutes) {
        if (seconds >= 30) minutes += 1;
        seconds = 0;

        if (minutes === 60) {
            hours += 1 % 24;
            minutes = 0;
        }
    }

    let amOrPm = (hours < 12 || hours === 24) ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    let timeString = '';
    if (roundMinutes) {
        timeString = `${hours}:${minutes} ${amOrPm}`;
    } else {
        seconds = seconds.toString().padStart(2, '0');
        timeString = `${hours}:${minutes}:${seconds} ${amOrPm}`;
    }

    return timeString;
}

function typetostr(eduLevelString) {
    switch (eduLevelString) {
        case 'Low': return 0;
        case 'HighSchoolOrCollege': return 1;
        case 'Bachelors': return 2;
        case 'Graduate': return 3;
        default: return '';
    }
}

function typeinttostr(eduLevelInteger) {
    switch (eduLevelInteger) {
        case 0: return 'Low';
        case 1: return 'HighSchoolOrCollege';
        case 2: return 'Bachelors';
        case 3: return 'Graduate';
        default: return -1;
    }
}

function strweekdays(weekDaysString) {
    const [entityId, countryId] = weekDaysString.split(',');
    return [entityId.trim(), countryId.trim()];
}

// async function initData() {
//     dataJobs = {};
//     for (const row of Object.values(jobsJson)) {
//         const nodeid = row['nodeid'];
//         const id_ = row['id_'];
//         const hourlyRev = row['hourlyRev'];
//         const timestamp_1 = tstdecimal(row['timestamp_1']);
//         const timestamp_2 = tstdecimal(row['timestamp_2']);
//         const weekDays = strweekdays(row['details']);
//         const eduReq = row['entity'];

//         dataJobs[nodeid] = {
//             nodeid,
//             id_,
//             hourlyRev,
//             timestamp_1,
//             timestamp_2,
//             weekDays,
//             eduReq,
//             participants: [],
//         };
//     }

//     dataJobsNetwork = {};
//     for (const job of Object.values(dataJobs)) {
//         const nodeid = job.nodeid;
//         const id_ = job.id_;

//         if (dataJobsNetwork[id_] === undefined) {
//             dataJobsNetwork[id_] = [];
//         }
//         dataJobsNetwork[id_].push(nodeid);
//     }
// }

function BeeswarmChart() {
    beeswarm.svg = d3.select('#beeswarmChart');

    beeswarm.chart = beeswarm.svg.append('g')
        .attr('transform', `translate(${beeswarm.chartOffsetX}, ${beeswarm.chartOffsetY})`);

    beeswarm.xScale = d3.scaleBand()
        .range([0, beeswarm.chartWidth]);

    beeswarm.xAxis = beeswarm.chart.append('g')
        .attr('transform', `translate(0, ${beeswarm.chartHeight})`)
        .call(d3.axisBottom(beeswarm.xScale));

    beeswarm.xLabel = beeswarm.chart.append('g')
        .attr('transform', `translate(${beeswarm.chartWidth / 2}, ${beeswarm.chartHeight + beeswarm.chartXLabelOffsetY})`)
        .append('text')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Type');

    beeswarm.rScale = d3.scaleSqrt()
        .range([beeswarm.circleMinRadius, beeswarm.circleMaxRadius]);

    beeswarm.tooltip = d3.select('body')
        .append('div')
        .attr('id', 'beesarmTooltip')
        .style('visibility', 'hidden')
        .style('position', 'absolute')
        .style('left', '0px')
        .style('top', '0px')
        .style('transform', 'translate(-100%, -100%)')
        .style('width', 'max-content')
        .style('height', 'max-content')
        .style('background-color', 'rgba(255, 255, 255, 50%)')
        .style('backdrop-filter', 'blur(8px)')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-color', 'black')
        .style('border-radius', '5px')
        .style('padding', '10px');
}

function Beeswarm_Focus() {
    const svg = d3.select('#beeswarmClock');

    beeswarmFocus.chart = svg.append('g')
        .attr('transform', `translate(${beeswarmFocus.chartOffsetX}, ${beeswarmFocus.chartOffsetY})`);

    beeswarmFocus.clockRadius = Math.min(beeswarmFocus.chartWidth, beeswarmFocus.chartHeight) / 2;

    beeswarmFocus.chart.append('circle')
        .attr('cx', beeswarmFocus.chartWidth / 2)
        .attr('cy', beeswarmFocus.chartHeight / 2)
        .attr('r', beeswarmFocus.clockRadius)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 2);

    beeswarmFocus.chart.append('circle')
        .attr('cx', beeswarmFocus.chartWidth / 2)
        .attr('cy', beeswarmFocus.chartHeight / 2)
        .attr('r', beeswarmFocus.centreDotRadius)
        .style('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', beeswarmFocus.hourTickWidth);

    beeswarmFocus.chart.selectAll('.tick.hour')
        .data(d3.range(0, 12))
        .join('line')
        .attr('class', 'tick hour')
        .style('stroke', 'black')
        .style('stroke-width', beeswarmFocus.hourTickWidth)
        .attr('transform', (d) => `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${d * 30})`)
        .attr('y1', beeswarmFocus.clockRadius - beeswarmFocus.hourTickLength)
        .attr('y2', beeswarmFocus.clockRadius);

    beeswarmFocus.chart.selectAll('.tick.minute')
        .data(d3.range(0, 60))
        .join('line')
        .attr('class', 'tick minute')
        .style('stroke', 'black')
        .style('stroke-width', beeswarm.minuteTickWidth)
        .attr('transform', (d) => `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${d * 6})`)
        .attr('y1', beeswarmFocus.clockRadius - beeswarmFocus.minuteTickLength)
        .attr('y2', beeswarmFocus.clockRadius);

    beeswarmFocus.chart.selectAll('.label.hour')
        .data(d3.range(1, 12+1))
        .join('text')
        .attr('class', 'label hour')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2})`)
        .attr('x', (d) => (beeswarmFocus.clockRadius - beeswarmFocus.hourLabelGap) * Math.cos(d * 30 / 180 * Math.PI - Math.PI / 2))
        .attr('y', (d) => (beeswarmFocus.clockRadius - beeswarmFocus.hourLabelGap) * Math.sin(d * 30 / 180 * Math.PI - Math.PI / 2))
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .text((d) => `${d}`);

    beeswarmFocus.startHourHand = beeswarmFocus.chart.append('line')
        .style('stroke', 'green')
        .style('stroke-width', beeswarmFocus.hourHandWidth)
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${90})`)
        .attr('y1', beeswarmFocus.centreDotRadius)
        .attr('y2', beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap)
        .style('visibility', 'hidden');

    beeswarmFocus.startHourHandLabel = beeswarmFocus.chart.append('text')
        .style('fill', 'green')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${90 - 90})`)
        .attr('x', -beeswarmFocus.centreDotRadius - (beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap - beeswarmFocus.centreDotRadius) / 2)
        .attr('y', -beeswarmFocus.hourHandWidth)
        .style('text-anchor', 'middle')
        .text('START')
        .style('visibility', 'hidden');

    beeswarmFocus.endHourHand = beeswarmFocus.chart.append('line')
        .style('stroke', 'red')
        .style('stroke-width', beeswarmFocus.hourHandWidth)
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${-90})`)
        .attr('y1', beeswarmFocus.centreDotRadius)
        .attr('y2', beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap)
        .style('visibility', 'hidden');

    beeswarmFocus.endHourHandLabel = beeswarmFocus.chart.append('text')
        .style('fill', 'red')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${-90 + 90})`)
        .attr('x', beeswarmFocus.centreDotRadius + (beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap - beeswarmFocus.centreDotRadius) / 2)
        .attr('y', -beeswarmFocus.hourHandWidth)
        .style('text-anchor', 'middle')
        .text('STOP')
        .style('visibility', 'hidden');
}

async function Beeswarm_Chart() {
    if (beeswarm.chart === null) BeeswarmChart();

    let chartData = Object.values(dataJobs);

    const partitioned = partition_data(chartData, 'eduReq');
    for (const arr of partitioned) {
        arr.sort((a, b) => b.hourlyRev - a.hourlyRev);
        arr.splice(30);
    }
    chartData = partitioned.flat();

    const xAxisDomain = new Set();
    let circleMaxR = -Infinity;
    let circleMinR = Infinity;
    for (const d of chartData) {
        xAxisDomain.add(d.eduReq);
        circleMaxR = Math.max(d.hourlyRev, circleMaxR);
        circleMinR = Math.min(d.hourlyRev, circleMinR);
    }

    beeswarm.xScale.domain([...xAxisDomain].sort((a, b) => typetostr(a) - typetostr(b)));
    beeswarm.xAxis
        .transition()
        .duration(animationDuration)
        .call(d3.axisBottom(beeswarm.xScale));

    beeswarm.rScale.domain([circleMinR, circleMaxR]);

    for (const d of chartData) {
        d.x = beeswarm.xScale(d.eduReq) + beeswarm.xScale.bandwidth() / 2;
        d.y = beeswarm.chartHeight / 2;
    }

    console.debug('**** BEESWARM SIM START');
    d3.select('body').classed('cursorWait', true);
    console.time('beeswarm:sim');
    const simulation = d3.forceSimulation(chartData)
        .alpha(1)
        .alphaDecay(0.05)
        .alphaMin(1e-3)
        .force('x', d3.forceX((d) => beeswarm.xScale(d.eduReq) + beeswarm.xScale.bandwidth() / 2).strength(0.5))
        .force('y', d3.forceY(beeswarm.chartHeight / 2).strength(0.2))
        .force('collide', d3.forceCollide((d) => 1 + beeswarm.rScale(d.hourlyRev)).strength(0.5).iterations(2));
    await new Promise(resolve => { simulation.on('end', resolve); });
    console.timeEnd('beeswarm:sim');
    d3.select('body').classed('cursorWait', false);
    console.debug('**** BEESWARM SIM FINISH');

    function buildTooltipHtml(d) {
        return `
            Entity ID: <strong>${d.weekDays[0]}</strong>
            <br>
            Country ID: <strong>${d.weekDays[1]}</strong>
            <br>
            Type : <strong>${d.eduReq}</strong>
        `;
    }

    function handleMouseOver(event, d) {
        // beeswarm.tooltip
        //     .html(buildTooltipHtml(d))
        //     .style('left', `${event.pexperienceX + beeswarm.tooltipOffsetX}px`)
        //     .style('top', `${event.pexperienceY + beeswarm.tooltipOffsetY}px`)
        //     .style('visibility', 'visible');

        d3.select('#beeswarmDetail').html(buildTooltipHtml(d));

        drawBeeswarmFocusChart(d.nodeid);

        const sameEmployerJobs = dataEmployers[d.id_]?.jobs ?? [];
        beeswarm.chart
            .selectAll('.myCircle')
            .filter((d) => sameEmployerJobs.includes(d.nodeid) && d.nodeid !== selectednodeid)
            .style('fill', beeswarm.circleColorHover);
        beeswarm.chart
            .selectAll('.mySector')
            .filter((d) => sameEmployerJobs.includes(d.nodeid) && d.nodeid !== selectednodeid)
            .style('fill', beeswarm.circleColorHover);
    }

    function handleMouseMove(event, d) {
        // beeswarm.tooltip
        //     .style('left', `${event.pexperienceX + beeswarm.tooltipOffsetX}px`)
        //     .style('top', `${event.pexperienceY + beeswarm.tooltipOffsetY}px`);
    }

    function handleMouseOut(event, d) {
        // beeswarm.tooltip.style('visibility', 'hidden');

        d3.select('#beeswarmDetail').html(beeswarmFocus.detailDefaultHtml);

        drawBeeswarmFocusChart(-1);

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', (d) => d.nodeid === selectednodeid ? beeswarm.circleColorClick : beeswarm.circleColorOffTheClock)
            .style('opacity', (d) => d.nodeid === selectednodeid ? 1 : (selectednodeid === -1 ? 1 : 0.5));
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', (d) => d.nodeid === selectednodeid ? beeswarm.circleColorClick : beeswarm.circleColorOnTheClock)
            .style('opacity', (d) => d.nodeid === selectednodeid ? 1 : (selectednodeid === -1 ? 1 : 0.5));
    }

    function handleClick(event, d) {
        // trigger spider chart
        spiderid_SetterFunc(d.id_);

        selectednodeid = d.nodeid;

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', (d) => d.nodeid === selectednodeid ? beeswarm.circleColorClick : beeswarm.circleColorOffTheClock)
            .style('opacity', (d) => d.nodeid === selectednodeid ? 1 : 0.5);
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', (d) => d.nodeid === selectednodeid ? beeswarm.circleColorClick : beeswarm.circleColorOnTheClock)
            .style('opacity', (d) => d.nodeid === selectednodeid ? 1 : 0.5);

        handleMouseOver(null, d);

        event.stopPropagation();
    }

    beeswarm.chart
        .selectAll('.myCircle')
        .data(chartData, (d) => d.nodeid)
        .join('circle')
        .attr('class', 'myCircle')
        .style('fill', beeswarm.circleColorOffTheClock)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('opacity', 1)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 0)
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
        .transition()
        .duration(animationDuration)
        .attr('r', (d) => beeswarm.rScale(d.hourlyRev));

    beeswarm.chart
        .selectAll('.mySector')
        .data(chartData, (d) => d.nodeid)
        .join('path')
        .attr('class', 'mySector')
        .style('fill', beeswarm.circleColorOnTheClock)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('opacity', 1)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', handleMouseOver)
        .on('mousemove',handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
        .transition()
        .duration(animationDuration)
        .attrTween('d', (d) => {
            const radiusInterpolator = d3.interpolate(0, beeswarm.rScale(d.hourlyRev));
            const buildArc = d3.arc()
                .innerRadius(0)
                .startAngle(d.timestamp_1 / 12 * 2 * Math.PI)
                .endAngle(d.timestamp_2 / 12 * 2 * Math.PI);
            return (t) => buildArc({ outerRadius: radiusInterpolator(t) });
        });

    beeswarm.chart
        .selectAll('.myStartLine')
        .data(chartData, (d) => d.nodeid)
        .join('line')
        .attr('class', 'myStartLine')
        .style('stroke', beeswarm.lineColortimestamp_1)
        .style('stroke-width', 3)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
        .transition()
        .duration(animationDuration)
        .attr('x2', (d) => beeswarm.rScale(d.hourlyRev) * Math.cos(d.timestamp_1 / 12 * 2 * Math.PI - Math.PI / 2))
        .attr('y2', (d) => beeswarm.rScale(d.hourlyRev) * Math.sin(d.timestamp_1 / 12 * 2 * Math.PI - Math.PI / 2));

    beeswarm.svg.on('click', (event) => {
        selectednodeid = -1;

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', beeswarm.circleColorOffTheClock)
            .style('opacity', 1);
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', beeswarm.circleColorOnTheClock)
            .style('opacity', 1);
    });
}

async function drawBeeswarmFocusChart(nodeid) {
    if (beeswarmFocus.chart === null) Beeswarm_Focus();

    if (nodeid === -1 || dataJobs[nodeid] === undefined) {
        beeswarmFocus.startHourHand
            .style('visibility', 'hidden');

        beeswarmFocus.startHourHandLabel
            .style('visibility', 'hidden');

        beeswarmFocus.endHourHand
            .style('visibility', 'hidden');

        beeswarmFocus.endHourHandLabel
            .style('visibility', 'hidden');
    } else {
        const job = dataJobs[nodeid];

        beeswarmFocus.startHourHand
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.timestamp_1 * 30 - 180})`);

        beeswarmFocus.startHourHandLabel
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.timestamp_1 * 30 - 90 - 180})`);

        beeswarmFocus.endHourHand
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.timestamp_2 * 30 - 180})`);

        beeswarmFocus.endHourHandLabel
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.timestamp_2 * 30 + 90 - 180})`);
    }
}

const Beeswarm = () => {
    // useEffect(() => {
        // initData();
    // }, []);

    // console.debug('**** BEESWARM INIT');
    // useEffect(() => {
    //     console.debug('**** BEESWARM MOUNT');

    //     return function() {
    //         console.debug('**** BEESWARM UNMOUNT');
    //     }
    // }, []);

    const d = useContext(Data);
    const contextJobsData = useMemo(() => d.jobsData, [d]);
    const contextEmployersData = useMemo(() => d.employersData, [d]);
    const contextSetSpiderid_ = useMemo(() => d.setSpiderid_, [d]);

    useEffect(() => {
        const work = async () => {
            if (chartBusy) return;
            chartBusy = true;

            dataJobs = contextJobsData;
            dataEmployers = contextEmployersData;

            spiderid_SetterFunc = contextSetSpiderid_;

            selectednodeid = -1;

            await Promise.all([Beeswarm_Chart(), drawBeeswarmFocusChart(-1)]);

            chartBusy = false;
        }
        work();
    }, [contextJobsData, contextEmployersData, contextSetSpiderid_]);

    return (
        <div id="beeswarm"style={{display: "flex"}}>
            <div style={{display: "flex", flexDirection:"row", alignItems:"center"}}>
                <div id="beeswarmBox2">
                        
                        <div id="beeswarmDetail" dangerouslySetInnerHTML={{ __html: beeswarmFocus.detailDefaultHtml }}></div>
                </div>
                <div style={{display:"flex", flexDirection: "column"}}>
                    <div id="beeswarmBox1">
                        <svg id="beeswarmChart"></svg>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Beeswarm;

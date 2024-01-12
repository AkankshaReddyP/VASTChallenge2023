import { createContext, useEffect, useState } from 'react';
import pdataJson from "./data/MC1.json";
import bdataJson from "./data/other/buildings.json";
import emdata from "./data/other/employers.json";
import jdataJson from "./data/MC2.json";
import pjdataJson from "./data/relations.json";

export const Data = createContext();

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

function strweekdays(weekDaysString) {
    const days = weekDaysString.substring(1, weekDaysString.length - 1).split(',');
    return days
}

const DataProvider = ({children}) => {
    let jdata = {};
    for (const row of Object.values(jdataJson)) {
        const nodeid = row['nodeid'];
        const id_ = row['id_'];
        const hourlyRev = row['hourlyRev'];
        const timestamp_1 = tstdecimal(row['timestamp_1']);
        const timestamp_2 = tstdecimal(row['timestamp_2']);
        const weekDays = strweekdays(row['details']);
        const eduReq = row['entity'];

        jdata[nodeid] = {
            nodeid,
            id_,
            hourlyRev,
            timestamp_1,
            timestamp_2,
            weekDays,
            eduReq,
            participants: [],
        };
    }

    let edata = {};
    for (const row of Object.values(emdata)) {
        const id_ = row['id_'];
        const buildingId = row['buildingId'];

        edata[id_] = {
            id_,
            buildingId,
            jobs: [],
        };
    }

    let pdata = {};
    for (const row of Object.values(pdataJson)) {
        const entityid = parseInt(row['entityid']);
        const experience = row['experience'];
        const profit_percent = row['profit_percent'];
        const type = row['type'];
        const interestGroup = row['interestGroup'];
        const debit = row['debit'];
        const credit = row['credit'];
        const Adjustment = row['Adjustment'];
        const investments = row['investments'];
        const revenue = row['revenue'];
        const Travel = row['Travel'];

        pdata[entityid] = {
            entityid,
            experience,
            profit_percent,
            type,
            interestGroup,
            debit,
            credit,
            Adjustment,
            investments,
            revenue,
            Travel,
            jobs: [],
        };
    }

    for (let [entityid, nodeidList] of Object.entries(pjdataJson)) {
        nodeidList = nodeidList.map(x => parseInt(x));

        pdata[entityid].jobs.push(...nodeidList);

        for (const nodeid of nodeidList) {
            jdata[nodeid].participants.push(entityid);
        }
    }

    for (const job of Object.values(jdata)) {
        const employer = edata[job.id_];
        employer.jobs.push(job.nodeid);
    }

    const [participantsData, setParticipantsData] = useState(pdata);
    const [buildingsData, setBuildingsData] = useState(bdataJson);
    const [employersData, setEmployersData] = useState(edata);
    const [jobsData, setJobsData] = useState(jdata);
    const [selectedBuildings, setSelectedBuildings] = useState(bdataJson);
    const [participantsPieData, setParticipantsPieData] = useState(pdata);
    const [spiderid_, setSpiderid_] = useState(-1);

    // Jbhoite
    const [participantsID, setParticipantsID] = useState(-1);
    

    const [filterControls, setFilter] = useState({
        experienceRange : [18, 60],
        InterestGroup : ["A","B","C","D","E","F","G","H","I"],
        capital : ["person", "political_organization", "Vessel", "company"],
    });
    const [isParticipantSelected, setParticipantSelected] = useState(false);
    const [selectedentityid, setSelectedentityid] = useState([]); //arra when parallel is selected we are gonna appedn to tshis first array, passing setselectedparticiapantid that you will be able to do, that will be filtered only when if selected then bool one will be true,
    // in parallel check if



    useEffect(() => {
        console.log("here in data provider filter useEffect =======================- ", filterControls)
        const filter_participant = Object.fromEntries(
            Object.entries(pdata).filter(([entityid, participant]) => {
                
                const isInterestGroupMatched = filterControls.InterestGroup.includes(participant.interestGroup);
                const iscapitalMatched = filterControls.capital.includes(participant.type);
                // console.log("isexperienceInRange, isInterestGroupMatched, iscapitalMatched - ", isexperienceInRange, isInterestGroupMatched, iscapitalMatched)

                return isInterestGroupMatched && iscapitalMatched;
            })
        );
        console.log("filter_participant - ", filter_participant);
        setParticipantsData(filter_participant);

        const filterednodeidSet = new Set();
        const filteredid_Set = new Set();
        for (const participant of Object.values(filter_participant)) {
            for (const nodeid of participant.jobs) {
                filterednodeidSet.add(nodeid);
                filteredid_Set.add(jdata[nodeid].id_);
            }
        }
        const filter_entities = Object.fromEntries(
            Object.entries(jdata).filter(([nodeid, job]) => filterednodeidSet.has(parseInt(nodeid)))
        );
        console.log('filter_entities', filter_entities);
        setJobsData(filter_entities);
        const filter_Employee = Object.fromEntries(
            Object.entries(edata).filter(([id_, employer]) => filteredid_Set.has(parseInt(id_)))
        );
        console.log('filter_Employee', filter_Employee);
        setEmployersData(filter_Employee);
    }, [filterControls]);

    return (
        <Data.Provider value={{
            participantsData, setParticipantsData,
            participantsID,setParticipantsID,
            buildingsData, setBuildingsData,
            employersData, setEmployersData,
            jobsData, setJobsData,

            setFilter,
            selectedBuildings, setSelectedBuildings,
            participantsPieData, setParticipantsPieData,

            spiderid_, setSpiderid_,
        }}>
            {children}
        </Data.Provider>
    )
}

export default DataProvider;
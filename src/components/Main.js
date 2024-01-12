import React from "react";
import SocialNetwork from "./charts/SocialNetwork";
import Beeswarm from "./charts/Beeswarm";


const MainComponent = () => {
    return (
        <div className="main-component" style={{ display: "flex", flexDirection: "column" }}>
            <div className="heading-text" style={{ marginTop: "10%" }}>MC1</div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: "20px" }}>
                <Beeswarm />
            </div>
            
            <div className="heading-text" style={{ marginTop: "100px" }}>MC3</div>
            <div style={{ borderRadius: "20px", alignItems: "center", margin: "10px", marginTop: "20px" }}>
                <SocialNetwork />
            </div>
            {/* <Spider/> */}

        </div>
    )
}

export default MainComponent;

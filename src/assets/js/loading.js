import React from "react";
import loading_img from '../../assets/image/spinner.gif';
import sync from '../../assets/image/sync.gif';
import '../css/app.css';

export const loading = (visibility, type) => {
    return (
        <div
            className={"loading"}
            style={{ display: visibility ? "block" : "none" }}
        >
            <img
                className="loading-image"
                src={loading_img}
                alt="Loading..."
                height="100"
                width="100"
                style={{ borderRadius: "10px",display: type === "spinner" ? "block" : "none" }}
            />
            <img
                className="loading-image-sync"
                src={sync}
                alt="Syncing..."
                height="100"
                width="100"
                style={{ borderRadius: "10px",display: type === "sync" ? "block" : "none" }}
            />
        </div>
    )

}
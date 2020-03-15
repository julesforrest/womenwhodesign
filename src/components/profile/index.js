import React from "react";
// import Img from "gatsby-image";
import twitter from "../../twitter.svg";
import LocationIcon from "../location";
import LinkIcon from "../linkIcon";
import styles from "./profile.module.scss";

const Profile = props => {
  return (
    <div
      className={styles.profile}
      style={{
        "--profile-theme-color": props.hex === "#FFFFFF" ? "#1da1f2" : props.hex
      }}
    >
      <img
        className={styles.grayImage}
        alt={`${props.name}'s avatar on Twitter.'`}
        src={props.image}
        loading="lazy"
      />
      <h2 className={styles.name}>{props.name}</h2>
      <p className={styles.handle}>@{props.handle}</p>
      <p className={styles.location}>
        <LocationIcon
          style={{ marginBottom: "-2px", marginRight: "2px" }}
          size={15}
        />{" "}
        {props.location}
      </p>
      <div className={styles.url}>
        <LinkIcon style={{ marginBottom: "-2px", marginRight: "4px" }} />

        {props.expandedUrl ? (
          <a
            href={props.expandedUrl}
            className={styles.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.displayUrl}
          </a>
        ) : (
          "N/A"
        )}
      </div>

      <p
        className={styles.description}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: props.description }}
      />
      <a
        href={`https://twitter.com/${props.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkContainer}
      >
        <span className={styles.linkText}>
          <img
            src={twitter}
            alt=""
            style={{
              height: "12px",
              paddingRight: "8px",
              marginBottom: "-2px"
            }}
          />
          Twitter
          <span className={styles.linkArrow}>→</span>
        </span>
      </a>
    </div>
  );
};

export default Profile;

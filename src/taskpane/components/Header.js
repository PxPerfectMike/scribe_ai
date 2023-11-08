import * as React from "react";
import PropTypes from "prop-types";

export default class Header extends React.Component {
  render() {
    const { logo } = this.props;

    const styles = {
      maxLogoSize: "500px",
      logoSize: "50%",
      fontFamily: "'Edu TAS Beginner', cursive",
    };

    const data = {
      title: "Scribe!",
      titleCaption: "Highlight text and modify it!",
    };

    return (
      <section
        className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500"
        style={{ backgroundColor: "transparent" }}
      >
        <img
          width={styles.logoSize}
          height={styles.logoSize}
          src={logo}
          alt={data.title}
          style={{
            userSelect: "none",
            maxHeight: styles.maxLogoSize,
            maxWidth: styles.maxLogoSize,
          }}
        />
        <h1
          className="ms-fontSize-su ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{
            userSelect: "none",
            fontFamily: styles.fontFamily,
            margin: "3% auto",
            color: "#070706",
            fontWeight: "bold",
          }}
        >
          {data.title}
        </h1>
        <h2
          className="ms-fontSize-l ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{
            userSelect: "none",
            fontFamily: styles.fontFamily,
            margin: "auto",
            textAlign: "center",
            color: "#070706",
            fontWeight: "bold",
          }}
        >
          {data.titleCaption}
        </h2>
      </section>
    );
  }
}

Header.propTypes = {
  logo: PropTypes.string,
};
